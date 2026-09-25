import { type FirebaseApp, initializeApp } from 'firebase/app'

/**
 * Firebase is optional at dev time. MobileMastery is designed to run entirely on local/mock data
 * when no Firebase project is configured (see src/repositories), so a fresh clone works with
 * `npm install && npm run dev` and zero external setup. Once real credentials are provided via
 * `.env.local` (see .env.example), the same repository interfaces switch to live Firestore/Auth
 * automatically — no component code changes.
 */
const firebaseEnv = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const isFirebaseConfigured = Boolean(
  firebaseEnv.apiKey && firebaseEnv.projectId && firebaseEnv.appId,
)

let app: FirebaseApp | null = null

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Firebase is not configured. Set VITE_FIREBASE_* variables in .env.local, or use the ' +
        'local-data repositories (the default when these are unset) — see .env.example.',
    )
  }
  if (!app) {
    app = initializeApp({
      apiKey: firebaseEnv.apiKey,
      authDomain: firebaseEnv.authDomain,
      projectId: firebaseEnv.projectId,
      storageBucket: firebaseEnv.storageBucket,
      messagingSenderId: firebaseEnv.messagingSenderId,
      appId: firebaseEnv.appId,
      measurementId: firebaseEnv.measurementId,
    })
  }
  return app
}
