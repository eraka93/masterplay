import type { ReactNode } from 'react'

import styles from './StatTile.module.css'

interface StatTileProps {
  label: string
  value: string | number
  sub?: string
}

export function StatTile({ label, value, sub }: StatTileProps) {
  return (
    <div className={styles.tile}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {sub ? <span className={styles.sub}>{sub}</span> : null}
    </div>
  )
}

export function StatTileRow({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>
}
