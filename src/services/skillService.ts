import { getLessonsForSubject } from '@/data/content/lessons'
import type { QuizAttempt, SubjectSlug } from '@/models'

export interface SubjectProgress {
  lessonsCompleted: number
  lessonsTotal: number
  quizAverageScorePercent: number | null
  masteryPercent: number
}

/**
 * Mastery is a derived signal, not stored — see models/mastery.ts: it only reflects how much of
 * this subject's content is complete and how well its quizzes were answered, computed fresh from
 * activity + quiz-attempt history rather than a separately maintained document.
 */
export function computeSubjectProgress(
  subjectId: SubjectSlug,
  completedLessonIds: ReadonlySet<string>,
  quizAttempts: QuizAttempt[],
): SubjectProgress {
  const lessons = getLessonsForSubject(subjectId)
  const lessonsTotal = lessons.length
  const lessonsCompleted = lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length

  const subjectAttempts = quizAttempts.filter((attempt) =>
    lessons.some((lesson) => lesson.quizId === attempt.quizId),
  )
  const quizAverageScorePercent =
    subjectAttempts.length > 0
      ? Math.round(
          subjectAttempts.reduce((sum, attempt) => sum + attempt.scorePercent, 0) /
            subjectAttempts.length,
        )
      : null

  const completionPercent = lessonsTotal > 0 ? (lessonsCompleted / lessonsTotal) * 100 : 0
  const masteryPercent =
    quizAverageScorePercent === null
      ? Math.round(completionPercent * 0.7)
      : Math.round(completionPercent * 0.6 + quizAverageScorePercent * 0.4)

  return { lessonsCompleted, lessonsTotal, quizAverageScorePercent, masteryPercent }
}
