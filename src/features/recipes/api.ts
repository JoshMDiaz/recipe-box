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
import { requireUid } from "@/features/auth/auth";
import { db } from "@/lib/firebase";
import { photoToDataUrl } from "./image";
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
  const data = clean(input);
  if (photo) data.imageUrl = await photoToDataUrl(photo);
  await setDoc(docRef, {
    ...data,
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
  if (photo) data.imageUrl = await photoToDataUrl(photo);
  else if (photo === null) data.imageUrl = undefined;

  // updateDoc ignores undefined, so blanked-out fields must be deleted explicitly.
  const patch = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? deleteField()]));
  await updateDoc(doc(recipes(), existing.id), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteRecipe(recipe: Recipe) {
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
