import { useCallback, useEffect, useState } from 'react'

import type { UserProfile } from '@/models'

import { useRepositories } from './useRepositories'

/**
 * Deliberately not a data-fetching library (React Query, SWR, etc.) — the app's data shape is
 * simple (one profile doc, a handful of small collections) and the repository layer already
 * abstracts local vs. Firestore, so a full caching library would be weight without payoff here.
 */
export function useUserProfile() {
  const repos = useRepositories()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const next = await repos.userProfile.get()
    setProfile(next)
    setLoading(false)
  }, [repos])

  useEffect(() => {
    setLoading(true)
    void refresh()
  }, [refresh])

  return { profile, loading, refresh }
}
