import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import type { Firestore } from "firebase/firestore";
import { readFileSync } from "node:fs";

// Emulator hosts come from the env vars `firebase emulators:exec` sets.
export function createTestEnv() {
  return initializeTestEnvironment({
    projectId: "demo-recipe-box",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
}

// The test context hands back a compat instance; the modular functions accept it.
type Context = { firestore(): unknown };
export const firestoreOf = (ctx: Context) => ctx.firestore() as Firestore;
