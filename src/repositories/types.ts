/** A record type usable with the generic per-user collection repository. */
export interface Identifiable {
  id: string
}

/**
 * A minimal CRUD contract shared by every per-user data collection (activities, goals, notes,
 * quiz attempts, real-world problems, etc). Both the local (localStorage) and Firestore
 * implementations satisfy this exact shape, so feature code never branches on which backend is
 * active — see src/repositories/index.ts.
 */
export interface CollectionRepository<T extends Identifiable> {
  list(): Promise<T[]>
  get(id: string): Promise<T | null>
  upsert(item: T): Promise<void>
  remove(id: string): Promise<void>
}

/** A single-document-per-user contract, used for the user profile. */
export interface DocRepository<T> {
  get(): Promise<T | null>
  set(value: T): Promise<void>
  update(patch: Partial<T>): Promise<void>
}
