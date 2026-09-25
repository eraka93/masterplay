import { Link, useLocation } from 'react-router-dom'

import { SearchIcon } from '@/components/ui/icons'
import { NAV_ITEMS, SECONDARY_NAV_ITEMS } from '@/config/navigation'
import { useUserProfile } from '@/hooks/useUserProfile'

import styles from './TopBar.module.css'

const ALL_NAV = [...NAV_ITEMS, ...SECONDARY_NAV_ITEMS]

function useRouteTitle(): string {
  const { pathname } = useLocation()
  if (pathname === '/') return 'Home'
  const match = ALL_NAV.filter((item) => item.to !== '/' && pathname.startsWith(item.to)).sort(
    (a, b) => b.to.length - a.to.length,
  )[0]
  return match?.label ?? 'MobileMastery'
}

export function TopBar({ onOpenSearch }: { onOpenSearch: () => void }) {
  const title = useRouteTitle()
  const { profile } = useUserProfile()

  return (
    <header className={styles.bar}>
      <span className={styles.title}>{title}</span>
      <div className={styles.spacer} />

      <button className={styles.searchButton} onClick={onOpenSearch} aria-label="Search">
        <SearchIcon size={14} />
        <span>Search</span>
      </button>

      {profile ? (
        <>
          <span className={`${styles.chip} ${styles.chipStreak}`}>
            {profile.currentStreakDays}d streak
          </span>
          <span className={`${styles.chip} ${styles.chipXp}`}>{profile.totalXp} XP</span>
        </>
      ) : null}

      <Link to="/profile" className={styles.avatarLink} aria-label="Profile">
        <span className={styles.avatar}>
          {(profile?.displayName ?? 'M').charAt(0).toUpperCase()}
        </span>
      </Link>
    </header>
  )
}
