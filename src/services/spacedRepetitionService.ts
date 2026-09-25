import { addDaysIso } from '@/utils/date'

/**
 * v1 spaced-repetition scheduler — a deliberately simple SM-2-inspired scheme (spec section 13:
 * "A simple algorithm is enough initially. Design it so it can later become more sophisticated.").
 * `difficulty` (1 easiest – 5 hardest) and `successCount`/`reviewCount` already carry the signal
 * a future SM-2/FSRS-style scheduler would need, so upgrading later is a service-only change —
 * no data migration on ReviewScheduleEntry.
 */

const BASE_INTERVAL_DAYS = [1, 2, 4, 7, 14, 30, 60, 120]
const MIN_DIFFICULTY = 1
const MAX_DIFFICULTY = 5
const DEFAULT_DIFFICULTY = 3

export interface ReviewState {
  difficulty: number
  reviewCount: number
  successCount: number
}

export function createInitialReviewState(): ReviewState {
  return { difficulty: DEFAULT_DIFFICULTY, reviewCount: 0, successCount: 0 }
}

export function computeNextReview(
  previous: ReviewState,
  correct: boolean,
  today: string,
): ReviewState & { nextReviewDate: string; lastReviewedAt: string } {
  const difficulty = clamp(previous.difficulty + (correct ? -1 : 1), MIN_DIFFICULTY, MAX_DIFFICULTY)
  const reviewCount = previous.reviewCount + 1
  const successCount = previous.successCount + (correct ? 1 : 0)

  const intervalIndex = correct ? Math.min(successCount, BASE_INTERVAL_DAYS.length - 1) : 0
  const baseInterval = BASE_INTERVAL_DAYS[intervalIndex]!
  // Harder topics (difficulty > 3) come back sooner; easier topics (difficulty < 3) can wait longer.
  const difficultyMultiplier = 1 - (difficulty - DEFAULT_DIFFICULTY) * 0.15
  const intervalDays = Math.max(1, Math.round(baseInterval * difficultyMultiplier))

  return {
    difficulty,
    reviewCount,
    successCount,
    lastReviewedAt: today,
    nextReviewDate: addDaysIso(today, intervalDays),
  }
}

export function successRate(state: ReviewState): number {
  if (state.reviewCount === 0) return 0
  return Math.round((state.successCount / state.reviewCount) * 100)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
