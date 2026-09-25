import {
  type Auth,
  GoogleAuthProvider,
  type User as FirebaseUser,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'

import { getFirebaseApp, isFirebaseConfigured } from './config'

let authInstance: Auth | null = null

function getAuthInstance(): Auth {
  authInstance ??= getAuth(getFirebaseApp())
  return authInstance
}

export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void): () => void {
  if (!isFirebaseConfigured) {
    // No-op subscription: callers fall back to the local dev identity (see AuthProvider).
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(getAuthInstance(), callback)
}

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(getAuthInstance(), provider)
  return result.user
}

export async function signOut(): Promise<void> {
  if (!isFirebaseConfigured) return
  await firebaseSignOut(getAuthInstance())
}

export type { FirebaseUser }
