import type { DocRepository } from '../types'

function storageKey(uid: string, docName: string): string {
  return `mobilemastery:${uid}:doc:${docName}`
}

export function createLocalDocRepository<T extends object>(
  uid: string,
  docName: string,
): DocRepository<T> {
  const key = storageKey(uid, docName)

  function read(): T | null {
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  }

  function write(value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Best-effort; in-memory state remains correct for this session.
    }
  }

  return {
    async get() {
      return read()
    },
    async set(value) {
      write(value)
    },
    async update(patch) {
      const current = read()
      write({ ...(current ?? ({} as T)), ...patch })
    },
  }
}
