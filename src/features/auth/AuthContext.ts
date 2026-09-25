import { createContext } from 'react'

import type { FirebaseUser } from '@/firebase/auth'

export interface AuthContextValue {
  /** The Firebase user id, or LOCAL_DEV_UID when running without Firebase configured. */
  uid: string
  user: FirebaseUser | null
  isAuthenticated: boolean
  isFirebaseConfigured: boolean
  loading: boolean
  signIn: () => Promise<void>
  signOutUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
