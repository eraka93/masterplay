import type { DeveloperLevel } from '@/models'

/**
 * Level titles are gamification flavor only — see spec: "Do not imply actual professional
 * certification." They exist to make progress feel meaningful, not to claim a real job title.
 */
export const DEVELOPER_LEVELS: DeveloperLevel[] = [
  { id: 1, title: 'Explorer', minXp: 0, tagline: 'Just getting oriented.' },
  { id: 2, title: 'Junior Developer', minXp: 250, tagline: 'Building the fundamentals.' },
  { id: 3, title: 'Developer', minXp: 750, tagline: 'Comfortable shipping features.' },
  { id: 4, title: 'Advanced Developer', minXp: 1750, tagline: 'Digging into internals.' },
  { id: 5, title: 'Senior Developer', minXp: 3500, tagline: 'Owns hard problems end to end.' },
  { id: 6, title: 'Senior Mobile Engineer', minXp: 6000, tagline: 'Mobile-native depth.' },
  {
    id: 7,
    title: 'Mobile Specialist',
    minXp: 9500,
    tagline: 'The one people ask about RN internals.',
  },
  { id: 8, title: 'Staff Engineer', minXp: 14000, tagline: 'Sets direction beyond one team.' },
  { id: 9, title: 'Mobile Architect', minXp: 20000, tagline: 'Shapes how mobile is built here.' },
]

export function getLevelForXp(totalXp: number): DeveloperLevel {
  let current = DEVELOPER_LEVELS[0]!
  for (const level of DEVELOPER_LEVELS) {
    if (totalXp >= level.minXp) {
      current = level
    }
  }
  return current
}

export function getNextLevel(totalXp: number): DeveloperLevel | null {
  const current = getLevelForXp(totalXp)
  return DEVELOPER_LEVELS.find((level) => level.id === current.id + 1) ?? null
}

export function getLevelProgress(totalXp: number): {
  level: DeveloperLevel
  next: DeveloperLevel | null
  xpIntoLevel: number
  xpForNextLevel: number | null
  progressPercent: number
} {
  const level = getLevelForXp(totalXp)
  const next = getNextLevel(totalXp)
  const xpIntoLevel = totalXp - level.minXp
  const xpForNextLevel = next ? next.minXp - level.minXp : null
  const progressPercent = xpForNextLevel ? Math.min(100, (xpIntoLevel / xpForNextLevel) * 100) : 100
  return { level, next, xpIntoLevel, xpForNextLevel, progressPercent }
}
