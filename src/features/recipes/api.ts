import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
  type DocumentSnapshot,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { requireUid } from "@/features/auth/auth";
import { db, storage } from "@/lib/firebase";
import { compressImage } from "./image";
import { recipeSchema, type Recipe, type RecipeInput } from "./types";

/** Each user's recipes live under their own document, so the rules can check ownership by path. */
const recipes = () => collection(db, "users", requireUid(), "recipes");

function fromSnapshot(snap: DocumentSnapshot): Recipe {
  const data = snap.data({ serverTimestamps: "estimate" }) ?? {};
  const millis = (v: unknown) => (v instanceof Timestamp ? v.toMillis() : undefined);
  return recipeSchema.parse({
    ...data,
    id: snap.id,
    createdAt: millis(data.createdAt) ?? 0,
    updatedAt: millis(data.updatedAt),
  });
}

/** Trim strings and drop blank optional fields so they're omitted, not stored as "". */
function clean(input: RecipeInput): RecipeInput {
  const opt = (v?: string) => v?.trim() || undefined;
  const list = (v: string[]) => v.map((s) => s.trim()).filter(Boolean);
  return {
    title: input.title.trim(),
    description: opt(input.description),
    servings: opt(input.servings),
    totalTime: opt(input.totalTime),
    ingredients: list(input.ingredients),
    steps: list(input.steps),
    tags: [...new Set(list(input.tags).map((t) => t.toLowerCase()))],
    imageUrl: opt(input.imageUrl),
    sourceText: opt(input.sourceText),
  };
}

async function uploadPhoto(recipeId: string, file: File) {
  const blob = await compressImage(file);
  const ext = blob.type === "image/webp" ? "webp" : (file.name.split(".").pop() ?? "jpg");
  const path = `users/${requireUid()}/recipes/${recipeId}/${crypto.randomUUID()}.${ext}`;
  const objectRef = ref(storage, path);
  await uploadBytes(objectRef, blob, {
    contentType: blob.type || file.type,
    // Each upload gets a fresh path, so a cached copy is never stale. "private"
    // keeps shared caches from holding one user's photos.
    cacheControl: "private, max-age=31536000, immutable",
  });
  return { imagePath: path, imageUrl: await getDownloadURL(objectRef) };
}

async function removePhoto(path?: string) {
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
  } catch (err) {
    // Already gone is fine; anything else shouldn't block the recipe change.
    console.warn("Could not delete photo", path, err);
  }
}

export async function listRecipes(): Promise<Recipe[]> {
  const snap = await getDocs(query(recipes(), orderBy("createdAt", "desc")));
  return snap.docs.map(fromSnapshot);
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  const snap = await getDoc(doc(recipes(), id));
  return snap.exists() ? fromSnapshot(snap) : null;
}

export async function createRecipe(input: RecipeInput, photo?: File): Promise<string> {
  const docRef = doc(recipes());
  const upload = photo ? await uploadPhoto(docRef.id, photo) : {};
  await setDoc(docRef, {
    ...clean(input),
    ...upload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update a recipe. `photo`: a File replaces the photo, `null` removes it,
 * `undefined` leaves it alone.
 */
export async function updateRecipe(existing: Recipe, input: RecipeInput, photo?: File | null) {
  const data = clean(input);
  let image: { imageUrl?: string; imagePath?: string } = {
    imageUrl: existing.imageUrl,
    imagePath: existing.imagePath,
  };
  if (photo) image = await uploadPhoto(existing.id, photo);
  else if (photo === null) image = {};

  // updateDoc ignores undefined, so blanked-out fields must be deleted explicitly.
  const patch: Record<string, unknown> = Object.fromEntries(
    Object.entries({ ...data, ...image }).map(([k, v]) => [k, v ?? deleteField()]),
  );
  for (const k of ["imageUrl", "imagePath"] as const) if (!(k in image)) patch[k] = deleteField();

  await updateDoc(doc(recipes(), existing.id), { ...patch, updatedAt: serverTimestamp() });
  if (photo !== undefined && existing.imagePath !== image.imagePath) {
    await removePhoto(existing.imagePath);
  }
}

export async function deleteRecipe(recipe: Recipe) {
  await removePhoto(recipe.imagePath);
  await deleteDoc(doc(recipes(), recipe.id));
}

export async function seedRecipes(list: RecipeInput[]) {
  const batch = writeBatch(db);
  for (const r of list) {
    batch.set(doc(recipes()), {
      ...clean(r),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  await batch.commit();
}
