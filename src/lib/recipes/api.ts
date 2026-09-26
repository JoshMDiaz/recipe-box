/**
 * Recipe API — STUB backend.
 * Everything here is in-memory + localStorage so the UI works today.
 * To move to Firebase, replace each function body:
 *   listRecipes   -> getDocs(query(collection(db, "recipes"), orderBy("createdAt", "desc")))
 *   createRecipe  -> addDoc(collection(db, "recipes"), recipe)
 *   deleteRecipe  -> deleteDoc(doc(db, "recipes", id))
 *   uploadImage   -> uploadBytes(ref(storage, `recipes/${id}`), file) + getDownloadURL
 *   parseRecipe   -> Cloud Function that reads the text (optionally with AI)
 */
import { parseRecipeText } from "./parser";
import { seedRecipes } from "./seed";
import type { NewRecipe, Recipe } from "./types";

const KEY = "recipe-library:v1";
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

function load(): Recipe[] {
  if (typeof window === "undefined") return seedRecipes;
  const raw = localStorage.getItem(KEY);
  if (!raw) { localStorage.setItem(KEY, JSON.stringify(seedRecipes)); return seedRecipes; }
  try { return JSON.parse(raw) as Recipe[]; } catch { return seedRecipes; }
}
function save(list: Recipe[]) { localStorage.setItem(KEY, JSON.stringify(list)); }

export async function listRecipes(): Promise<Recipe[]> {
  await delay();
  return load().sort((a, b) => b.createdAt - a.createdAt);
}

export async function createRecipe(input: NewRecipe): Promise<Recipe> {
  await delay();
  const recipe: Recipe = { ...input, id: crypto.randomUUID(), createdAt: Date.now() };
  save([recipe, ...load()]);
  return recipe;
}

export async function deleteRecipe(id: string): Promise<void> {
  await delay();
  save(load().filter((r) => r.id !== id));
}

export async function parseRecipe(text: string): Promise<NewRecipe> {
  await delay(500);
  return parseRecipeText(text);
}

/** Stub: returns a data URL. Firebase Storage would return a download URL. */
export async function uploadImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
