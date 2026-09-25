import { hashString } from '@/utils/hash'

import styles from './Glyph.module.css'

interface GlyphProps {
  label: string
  seed: string
  size?: number
}

const PALETTE: [string, string][] = [
  ['#6ee7ff', '#7c8bff'],
  ['#f472b6', '#7c8bff'],
  ['#4ade80', '#22d3ee'],
  ['#fbbf24', '#fb7185'],
  ['#a78bfa', '#6ee7ff'],
  ['#fb7185', '#fbbf24'],
  ['#34d399', '#3b82f6'],
]

/** A deterministic, dependency-free stand-in for a per-subject icon set (see ARCHITECTURE.md). */
export function Glyph({ label, seed, size = 36 }: GlyphProps) {
  const [from, to] = PALETTE[hashString(seed) % PALETTE.length]!
  return (
    <span
      className={styles.glyph}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.32,
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
      aria-hidden="true"
    >
      {label}
    </span>
  )
}
