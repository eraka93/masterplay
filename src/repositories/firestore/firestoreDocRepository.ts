import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

import { getDb } from '@/firebase/firestore'

import type { DocRepository } from '../types'

export function createFirestoreDocRepository<T extends object>(
  uid: string,
  docName: string,
): DocRepository<T> {
  const docRef = doc(getDb(), 'users', uid, 'profile', docName)

  return {
    async get() {
      const snapshot = await getDoc(docRef)
      return snapshot.exists() ? (snapshot.data() as T) : null
    },
    async set(value) {
      await setDoc(docRef, value)
    },
    async update(patch) {
      await updateDoc(docRef, patch as Record<string, unknown>)
    },
  }
}
