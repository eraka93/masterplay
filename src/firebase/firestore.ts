import { initializeFirestore, persistentLocalCache, type Firestore } from 'firebase/firestore'

import { getFirebaseApp } from './config'

let firestoreInstance: Firestore | null = null

/**
 * Persistent (IndexedDB-backed) local cache, not the SDK default in-memory-only cache — this is
 * what makes previously-loaded data survive a reload while offline, and what queues writes made
 * offline for sync once the connection returns (spec section 40: offline architecture).
 */
export function getDb(): Firestore {
  firestoreInstance ??= initializeFirestore(getFirebaseApp(), {
    localCache: persistentLocalCache(),
  })
  return firestoreInstance
}
