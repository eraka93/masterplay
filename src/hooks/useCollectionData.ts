import { useCallback, useEffect, useState } from 'react'

import type { Repositories } from '@/repositories'

import { useRepositories } from './useRepositories'

/** Generic list-fetching hook shared by every feature that reads a per-user collection. */
export function useCollectionData<T>(select: (repos: Repositories) => Promise<T[]>) {
  const repos = useRepositories()
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const next = await select(repos)
    setItems(next)
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repos])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { items, loading, refresh }
}
