import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import type { Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";
import { readFileSync } from "node:fs";

// Emulator hosts come from the env vars `firebase emulators:exec` sets.
export function createTestEnv() {
  return initializeTestEnvironment({
    projectId: "demo-recipe-box",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
    storage: { rules: readFileSync("storage.rules", "utf8") },
  });
}

// The test contexts hand back compat instances; the modular functions accept them.
type Context = { firestore(): unknown; storage(): unknown };
export const firestoreOf = (ctx: Context) => ctx.firestore() as Firestore;
export const storageOf = (ctx: Context) => ctx.storage() as FirebaseStorage;
