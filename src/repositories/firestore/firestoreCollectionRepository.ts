import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'

import { getDb } from '@/firebase/firestore'

import type { CollectionRepository, Identifiable } from '../types'

/**
 * Firestore-backed implementation. Every per-user collection lives at `users/{uid}/{collection}`
 * (see docs/ARCHITECTURE.md for the full Firestore model rationale): this keeps security rules to
 * a single ownership check per collection, avoids collection-group queries this app never needs,
 * and keeps reads/writes scoped to the signed-in user's own subtree — the cheapest and safest
 * shape for a single-user-per-account learning app.
 */
export function createFirestoreCollectionRepository<T extends Identifiable>(
  uid: string,
  collectionName: string,
): CollectionRepository<T> {
  const colRef = collection(getDb(), 'users', uid, collectionName)

  return {
    async list() {
      const snapshot = await getDocs(colRef)
      return snapshot.docs.map((docSnapshot) => docSnapshot.data() as T)
    },
    async get(id) {
      const snapshot = await getDoc(doc(colRef, id))
      return snapshot.exists() ? (snapshot.data() as T) : null
    },
    async upsert(item) {
      await setDoc(doc(colRef, item.id), item)
    },
    async remove(id) {
      await deleteDoc(doc(colRef, id))
    },
  }
}
