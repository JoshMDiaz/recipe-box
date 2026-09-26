import {
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { deleteObject, getMetadata, ref, uploadBytes } from "firebase/storage";
import { afterAll, beforeAll, beforeEach, describe, test } from "vitest";
import { createTestEnv, storageOf } from "./setup";

let env: RulesTestEnvironment;
beforeAll(async () => {
  env = await createTestEnv();
});
afterAll(() => env.cleanup());
beforeEach(() => env.clearStorage());

const photoPath = (uid: string) => `users/${uid}/recipes/r1/photo.webp`;
const image = new Uint8Array([1, 2, 3]);
const asImage = { contentType: "image/webp" };

const storageAs = (uid: string) => storageOf(env.authenticatedContext(uid));

function seedAlicePhoto() {
  return env.withSecurityRulesDisabled(async (ctx) => {
    await uploadBytes(ref(storageOf(ctx), photoPath("alice")), image, asImage);
  });
}

describe("the owner", () => {
  test("can upload, read and delete their photos", async () => {
    const photo = ref(storageAs("alice"), photoPath("alice"));
    await assertSucceeds(uploadBytes(photo, image, asImage));
    await assertSucceeds(getMetadata(photo));
    await assertSucceeds(deleteObject(photo));
  });

  test("can only upload images", async () => {
    const file = ref(storageAs("alice"), photoPath("alice"));
    await assertFails(uploadBytes(file, image, { contentType: "text/html" }));
  });

  test("can't upload files of 10 MB or more", async () => {
    const photo = ref(storageAs("alice"), photoPath("alice"));
    await assertFails(uploadBytes(photo, new Uint8Array(10 * 1024 * 1024), asImage));
  });
});

test("another user can't read, overwrite or delete someone else's photos", async () => {
  await seedAlicePhoto();
  const photo = ref(storageAs("bob"), photoPath("alice"));
  await assertFails(getMetadata(photo));
  await assertFails(uploadBytes(photo, image, asImage));
  await assertFails(deleteObject(photo));
});

test("a signed-out visitor can't read or upload photos", async () => {
  await seedAlicePhoto();
  const photo = ref(storageOf(env.unauthenticatedContext()), photoPath("alice"));
  await assertFails(getMetadata(photo));
  await assertFails(uploadBytes(photo, image, asImage));
});
