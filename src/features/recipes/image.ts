const MAX_EDGE = 1600;

/**
 * Downscale a photo before upload. Phone photos are often 5–10 MB; recipe
 * cards never need more than ~1600px. Falls back to the original file if the
 * browser can't decode it (e.g. HEIC outside Safari).
 */
export async function compressImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = new OffscreenCanvas(
      Math.round(bitmap.width * scale),
      Math.round(bitmap.height * scale),
    );
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await canvas.convertToBlob({ type: "image/webp", quality: 0.82 });
    return blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}
