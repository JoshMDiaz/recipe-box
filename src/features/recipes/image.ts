/**
 * Photos are stored inside the recipe document as a data URL (no Cloud
 * Storage), so they must stay well under Firestore's 1 MB document limit.
 * Keep in sync with the imageUrl size check in firestore.rules.
 */
export const MAX_IMAGE_URL_LENGTH = 250_000;

/** Longest edge and quality, tried in order until the photo fits. */
const ATTEMPTS = [
  { edge: 800, quality: 0.75 },
  { edge: 800, quality: 0.6 },
  { edge: 600, quality: 0.6 },
  { edge: 480, quality: 0.5 },
  { edge: 400, quality: 0.4 },
  { edge: 320, quality: 0.3 },
];

/**
 * Shrink a photo and encode it as a data URL small enough to save on the
 * recipe. Phone photos are often 5–10 MB; a recipe card only needs ~800px.
 */
export async function photoToDataUrl(file: File): Promise<string> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // e.g. HEIC outside Safari.
    throw new Error("Couldn't read that photo. Try a JPEG or PNG.");
  }

  try {
    for (const { edge, quality } of ATTEMPTS) {
      const url = await blobToDataUrl(await encode(bitmap, edge, quality));
      if (url.length <= MAX_IMAGE_URL_LENGTH) return url;
    }
    throw new Error("That photo is too detailed to save. Try a different one.");
  } finally {
    bitmap.close();
  }
}

async function encode(bitmap: ImageBitmap, edge: number, quality: number) {
  const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
  const canvas = new OffscreenCanvas(
    Math.round(bitmap.width * scale),
    Math.round(bitmap.height * scale),
  );
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const webp = await canvas.convertToBlob({ type: "image/webp", quality });
  // Safari can't encode WebP and silently returns a PNG; JPEG is far smaller.
  return webp.type === "image/webp" ? webp : canvas.convertToBlob({ type: "image/jpeg", quality });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Couldn't read that photo."));
    reader.readAsDataURL(blob);
  });
}
