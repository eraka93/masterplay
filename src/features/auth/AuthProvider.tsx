import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  type FirebaseUser,
  signInWithGoogle,
  signOut,
  subscribeToAuthChanges,
} from '@/firebase/auth'
import { isFirebaseConfigured } from '@/firebase/config'
import { LOCAL_DEV_UID } from '@/repositories'

import { AuthContext, type AuthContextValue } from './AuthContext'

/**
 * Bridges Firebase Auth (when configured) into the rest of the app. When Firebase is not
 * configured, the app runs as a single local identity (LOCAL_DEV_UID) with no sign-in gate —
 * this keeps `npm run dev` immediately usable on a fresh clone. See docs/ARCHITECTURE.md.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    if (!isFirebaseConfigured) return
    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signIn = useCallback(async () => {
    if (!isFirebaseConfigured) return
    await signInWithGoogle()
  }, [])

  const signOutUser = useCallback(async () => {
    if (!isFirebaseConfigured) return
    await signOut()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      uid: user?.uid ?? LOCAL_DEV_UID,
      user,
      isAuthenticated: isFirebaseConfigured ? Boolean(user) : true,
      isFirebaseConfigured,
      loading,
      signIn,
      signOutUser,
    }),
    [user, loading, signIn, signOutUser],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
