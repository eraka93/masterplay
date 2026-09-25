import { NavLink } from 'react-router-dom'

import { Glyph } from '@/components/ui/Glyph'
import { NAV_ITEMS, SECONDARY_NAV_ITEMS } from '@/config/navigation'

import styles from './Sidebar.module.css'
import { ThemeToggle } from './ThemeToggle'

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <Glyph label="MM" seed="mobilemastery-brand" size={28} />
        <span className={styles.brandName}>MobileMastery</span>
      </div>

      <nav className={styles.nav}>
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

        <div className={styles.sectionLabel}>More</div>
        {SECONDARY_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
          >
            <span className={styles.linkGlyph}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.spacer} />

      <div className={styles.footer}>
        <ThemeToggle />
      </div>
    </aside>
  )
}
