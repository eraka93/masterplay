import type { CollectionRepository, Identifiable } from '../types'

const STORAGE_PREFIX = 'mobilemastery'

function storageKey(uid: string, collectionName: string): string {
  return `${STORAGE_PREFIX}:${uid}:${collectionName}`
}

function readAll<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    return JSON.parse(raw) as T[]
  } catch {
    // Corrupt or inaccessible storage (private browsing, quota) — fail soft to empty.
    return []
  }
}

function writeAll<T>(key: string, items: T[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(items))
  } catch {
    // Best-effort persistence; the in-memory app state remains correct for this session.
  }
}

/**
 * localStorage-backed implementation used when Firebase is not configured, and as the offline
 * fallback described in section 40 of the product spec. Data is namespaced per user id and per
 * collection so it mirrors the Firestore `users/{uid}/{collection}` layout exactly.
 */
export function createLocalCollectionRepository<T extends Identifiable>(
  uid: string,
  collectionName: string,
): CollectionRepository<T> {
  const key = storageKey(uid, collectionName)

  return {
    async list() {
      return readAll<T>(key)
    },
    async get(id) {
      const items = readAll<T>(key)
      return items.find((item) => item.id === id) ?? null
    },
    async upsert(item) {
      const items = readAll<T>(key)
      const index = items.findIndex((existing) => existing.id === item.id)
      if (index === -1) {
        items.push(item)
      } else {
        items[index] = item
      }
      writeAll(key, items)
    },
    async remove(id) {
      const items = readAll<T>(key)
      writeAll(
        key,
        items.filter((item) => item.id !== id),
      )
    },
  }
}
