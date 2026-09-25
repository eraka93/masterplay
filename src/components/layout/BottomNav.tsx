import { NavLink } from 'react-router-dom'

import { NAV_ITEMS } from '@/config/navigation'

import styles from './BottomNav.module.css'

export function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Primary">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
        >
          <span className={styles.linkGlyph}>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
