import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { OfflineBanner } from '@/components/ui/OfflineBanner'
import { GlobalSearch } from '@/features/search/GlobalSearch'
import { useForegroundNotifications } from '@/hooks/useForegroundNotifications'
import { useIsDesktop } from '@/hooks/useMediaQuery'

import styles from './AppShell.module.css'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell() {
  const isDesktop = useIsDesktop()
  const [searchOpen, setSearchOpen] = useState(false)
  useForegroundNotifications()

  return (
    <div className={styles.root}>
      {isDesktop ? <Sidebar /> : null}

      <div className={`${styles.main} ${isDesktop ? styles.mainWithSidebar : ''}`}>
        <OfflineBanner />
        <TopBar onOpenSearch={() => setSearchOpen(true)} />
        <div className={styles.content}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>

      {!isDesktop ? <BottomNav /> : null}

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
