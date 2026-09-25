import { describe, expect, it } from 'vitest'

import { getLevelForXp, getLevelProgress, getNextLevel } from './levels'

describe('getLevelForXp', () => {
  it('returns the first level at 0 XP', () => {
    expect(getLevelForXp(0).id).toBe(1)
  })

  it('returns the highest level whose minXp has been reached', () => {
    expect(getLevelForXp(3500).title).toBe('Senior Developer')
    expect(getLevelForXp(3499).title).not.toBe('Senior Developer')
  })

  it('returns the max level for very high XP', () => {
    expect(getLevelForXp(1_000_000).title).toBe('Mobile Architect')
  })
})

describe('getNextLevel', () => {
  it('returns null at the max level', () => {
    expect(getNextLevel(1_000_000)).toBeNull()
  })

  it('returns the following level otherwise', () => {
    expect(getNextLevel(0)?.title).toBe('Junior Developer')
  })
})

describe('getLevelProgress', () => {
  it('computes progress percent within the current level', () => {
    const progress = getLevelProgress(250) // exactly at level 2's minXp
    expect(progress.level.id).toBe(2)
    expect(progress.progressPercent).toBe(0)
  })

  it('caps progress at 100 for the max level', () => {
    const progress = getLevelProgress(1_000_000)
    expect(progress.progressPercent).toBe(100)
    expect(progress.next).toBeNull()
  })
})
