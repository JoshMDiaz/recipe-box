import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, initializeFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { z } from "zod";

const env = z
  .object({
    VITE_FIREBASE_PROJECT_ID: z.string().min(1),
    VITE_FIREBASE_API_KEY: z.string().min(1),
    VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1),
    VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1),
    VITE_FIREBASE_APP_ID: z.string().min(1),
    VITE_USE_FIREBASE_EMULATORS: z.stringbool().default(false),
  })
  .parse(import.meta.env);

export const usingEmulators = env.VITE_USE_FIREBASE_EMULATORS;

const app = initializeApp({
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  appId: env.VITE_FIREBASE_APP_ID,
});

// Optional recipe fields are left undefined rather than null; drop them on write.
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
export const storage = getStorage(app);

if (usingEmulators) {
  // Ports match firebase.json.
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}
