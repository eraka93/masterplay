import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Glyph } from '@/components/ui/Glyph'
import { PageSpinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { useRepositories } from '@/hooks/useRepositories'
import { recordAppOpen } from '@/services/progressService'
import { ensureSeeded } from '@/services/seedService'

import styles from './LoginGate.module.css'

export function LoginGate() {
  const { uid, isAuthenticated, isFirebaseConfigured, loading, signIn } = useAuth()
  const repos = useRepositories()
  const [bootstrapped, setBootstrapped] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    setBootstrapped(false)
    void (async () => {
      await ensureSeeded(uid, repos)
      await recordAppOpen(uid, repos)
      if (!cancelled) setBootstrapped(true)
    })()
    return () => {
      cancelled = true
    }
  }, [uid, isAuthenticated, repos])

  if (loading) return <PageSpinner />

  if (!isAuthenticated) {
    return (
      <div className={styles.wrap}>
        <Glyph label="MM" seed="mobilemastery-brand" size={56} />
        <div>
          <div className={styles.title}>MobileMastery</div>
          <p className={styles.subtitle}>
            Sign in to track your progress toward Senior / Staff Mobile Engineer, Mobile Architect.
          </p>
        </div>
        {isFirebaseConfigured ? (
          <Button variant="primary" onClick={() => void signIn()}>
            Continue with Google
          </Button>
        ) : (
          <p className={styles.subtitle}>Firebase is not configured for this build.</p>
        )}
      </div>
    )
  }

  if (!bootstrapped) return <PageSpinner />

  return <Outlet />
}
