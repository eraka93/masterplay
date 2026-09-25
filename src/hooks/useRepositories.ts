import { useMemo } from 'react'

import { createRepositories } from '@/repositories'

import { useAuth } from './useAuth'

/** Repositories scoped to the current user, re-created only when the uid changes. */
export function useRepositories() {
  const { uid } = useAuth()
  return useMemo(() => createRepositories(uid), [uid])
}
