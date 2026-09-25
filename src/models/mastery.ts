import type { SubjectSlug } from './content'

/**
 * SkillProgress is a derived, internal progress signal — a mix of content completion and
 * assessment performance for a subject. It intentionally does NOT claim to objectively measure
 * engineering ability; it only reflects how much of MobileMastery's content for that subject has
 * been completed and how well its quizzes/challenges were answered.
 */
export interface SkillProgress {
  subjectId: SubjectSlug
  userId: string
  /** 0-100. Weighted blend of lesson completion and quiz/challenge accuracy. */
  masteryPercent: number
  lessonsCompleted: number
  lessonsTotal: number
  quizAverageScorePercent: number | null
  lastUpdated: string
}

/**
 * Spaced-repetition schedule for a single topic (usually a lesson or a quiz topic string).
 * The v1 algorithm is a simple SM-2-inspired scheme (see services/spacedRepetitionService.ts);
 * the shape here is designed to support a more sophisticated scheduler later without a data
 * migration (difficulty and reviewCount already carry enough signal for SM-2 or FSRS-style scoring).
 */
export interface ReviewScheduleEntry {
  id: string
  userId: string
  topic: string
  subjectId: SubjectSlug
  lessonId?: string
  lastReviewedAt: string | null
  reviewCount: number
  successCount: number
  /** 1 (easiest) to 5 (hardest); starts at 3 and adapts based on recall performance. */
  difficulty: number
  nextReviewDate: string
}
