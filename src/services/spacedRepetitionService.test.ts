import { describe, expect, it } from 'vitest'

import { computeNextReview, createInitialReviewState, successRate } from './spacedRepetitionService'

describe('computeNextReview', () => {
  it('makes the topic easier and schedules further out after a correct answer', () => {
    const initial = createInitialReviewState()
    const result = computeNextReview(initial, true, '2026-01-01')
    expect(result.difficulty).toBeLessThan(initial.difficulty)
    expect(result.nextReviewDate > '2026-01-01').toBe(true)
  })

  it('makes the topic harder and schedules sooner after an incorrect answer', () => {
    const initial = createInitialReviewState()
    const result = computeNextReview(initial, false, '2026-01-01')
    expect(result.difficulty).toBeGreaterThan(initial.difficulty)
    expect(result.nextReviewDate).toBe('2026-01-02')
  })

  it('does not let difficulty escape the 1-5 range', () => {
    let state = createInitialReviewState()
    for (let i = 0; i < 10; i += 1) {
      state = computeNextReview(state, true, '2026-01-01')
    }
    expect(state.difficulty).toBeGreaterThanOrEqual(1)

    let hardState = createInitialReviewState()
    for (let i = 0; i < 10; i += 1) {
      hardState = computeNextReview(hardState, false, '2026-01-01')
    }
    expect(hardState.difficulty).toBeLessThanOrEqual(5)
  })

  it('increments reviewCount and successCount correctly', () => {
    const first = computeNextReview(createInitialReviewState(), true, '2026-01-01')
    expect(first.reviewCount).toBe(1)
    expect(first.successCount).toBe(1)
    const second = computeNextReview(first, false, '2026-01-05')
    expect(second.reviewCount).toBe(2)
    expect(second.successCount).toBe(1)
  })
})

describe('successRate', () => {
  it('returns 0 for a topic never reviewed', () => {
    expect(successRate(createInitialReviewState())).toBe(0)
  })

  it('computes a rounded percentage', () => {
    expect(successRate({ difficulty: 3, reviewCount: 3, successCount: 2 })).toBe(67)
  })
})
