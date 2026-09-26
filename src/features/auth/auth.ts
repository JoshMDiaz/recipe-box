import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { useSyncExternalStore } from "react";
import { auth } from "@/lib/firebase";

/** The signed-in user, once Firebase has restored (or ruled out) a saved session. */
export async function getCurrentUser(): Promise<User | null> {
  await auth.authStateReady();
  return auth.currentUser;
}

/** The signed-in user's uid, for code that only runs behind the sign-in gate. */
export function requireUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("You're signed out. Sign in and try again.");
  return uid;
}

export function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, provider);
}

export function signOut() {
  return firebaseSignOut(auth);
}

const subscribe = (onChange: () => void) => onAuthStateChanged(auth, onChange);

export function useUser(): User | null {
  return useSyncExternalStore(subscribe, () => auth.currentUser);
}

/**
 * Only allow redirects back into this app: a path, not a full or
 * protocol-relative URL that could send the user somewhere else.
 */
export function safeRedirect(target: string | undefined): string {
  return target?.startsWith("/") && !target.startsWith("//") ? target : "/";
}
