import { useOnlineStatus } from '@/hooks/useOnlineStatus'

import styles from './OfflineBanner.module.css'

/**
 * See docs/ARCHITECTURE.md "Offline behavior": lessons/knowledge already loaded this session stay
 * readable, and local-mode data (the default without Firebase) never depends on the network at
 * all. This banner exists only to be honest about the one thing that IS network-dependent when
 * Firebase is configured: syncing new writes.
 */
export function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null

  return (
    <div className={styles.banner} role="status">
      Offline — showing cached content, changes will sync when you're back online
    </div>
  )
}
