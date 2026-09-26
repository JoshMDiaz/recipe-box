import {
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, test } from "vitest";
import { createTestEnv, firestoreOf } from "./setup";

let env: RulesTestEnvironment;
beforeAll(async () => {
  env = await createTestEnv();
});
afterAll(() => env.cleanup());
beforeEach(() => env.clearFirestore());

const newRecipe = () => ({
  title: "Toast",
  ingredients: ["bread"],
  steps: ["Toast it"],
  tags: [],
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

const dbAs = (uid: string) => firestoreOf(env.authenticatedContext(uid));
const signedOutDb = () => firestoreOf(env.unauthenticatedContext());
const recipePath = (uid: string) => `users/${uid}/recipes/r1`;

/** Write alice's recipe directly, bypassing the rules. */
function seedAliceRecipe() {
  return env.withSecurityRulesDisabled((ctx) =>
    setDoc(doc(firestoreOf(ctx), recipePath("alice")), newRecipe()),
  );
}

describe("the owner", () => {
  test("can create, read, list, update and delete their recipes", async () => {
    const db = dbAs("alice");
    const ref = doc(db, recipePath("alice"));
    await assertSucceeds(setDoc(ref, newRecipe()));
    await assertSucceeds(getDoc(ref));
    await assertSucceeds(getDocs(collection(db, "users/alice/recipes")));
    await assertSucceeds(updateDoc(ref, { title: "Better toast", updatedAt: serverTimestamp() }));
    await assertSucceeds(deleteDoc(ref));
  });

  test("can't add fields the rules don't know about", async () => {
    const ref = doc(dbAs("alice"), recipePath("alice"));
    await assertFails(setDoc(ref, { ...newRecipe(), ownerEmail: "alice@example.com" }));
  });

  test("can't backdate createdAt on create or change it on update", async () => {
    const ref = doc(dbAs("alice"), recipePath("alice"));
    await assertFails(setDoc(ref, { ...newRecipe(), createdAt: Timestamp.fromMillis(0) }));
    await assertSucceeds(setDoc(ref, newRecipe()));
    await assertFails(updateDoc(ref, { createdAt: Timestamp.fromMillis(0) }));
  });

  test("can't save a recipe without a title", async () => {
    const ref = doc(dbAs("alice"), recipePath("alice"));
    await assertFails(setDoc(ref, { ...newRecipe(), title: "" }));
  });
});

describe("another user", () => {
  test("can't read, list, update or delete someone else's recipes", async () => {
    await seedAliceRecipe();
    const db = dbAs("bob");
    const ref = doc(db, recipePath("alice"));
    await assertFails(getDoc(ref));
    await assertFails(getDocs(collection(db, "users/alice/recipes")));
    await assertFails(updateDoc(ref, { title: "Mine now" }));
    await assertFails(deleteDoc(ref));
  });

  test("can't create recipes in someone else's box", async () => {
    await assertFails(setDoc(doc(dbAs("bob"), recipePath("alice")), newRecipe()));
  });
});

describe("a signed-out visitor", () => {
  test("can't read or write recipes", async () => {
    await seedAliceRecipe();
    const db = signedOutDb();
    await assertFails(getDoc(doc(db, recipePath("alice"))));
    await assertFails(setDoc(doc(db, "users/anon/recipes/r1"), newRecipe()));
  });
});

test("the old shared recipes collection is closed", async () => {
  const db = dbAs("alice");
  await assertFails(getDocs(collection(db, "recipes")));
  await assertFails(setDoc(doc(db, "recipes/r1"), newRecipe()));
});
