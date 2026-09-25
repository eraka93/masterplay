import { LEARNING_PATHS_BY_ID } from '@/config/learningPaths'
import { getLessonsForSubject } from '@/data/content/lessons'
import { SUBJECTS_BY_ID } from '@/config/subjects'
import type { Lesson, Subject } from '@/models'

export interface ContinueLearningTarget {
  subject: Subject
  lesson: Lesson
  isFirstLessonInSubject: boolean
}

/**
 * Finds the next not-yet-completed lesson along the user's active learning path, in path/subject/
 * lesson order. Falls back to the first lesson in the content library if the path has no authored
 * content yet or everything in it is complete — the seed content only covers a handful of
 * subjects so far (see docs/ROADMAP.md for what's next).
 */
export function getContinueLearningTarget(
  learningPathId: string | null,
  completedLessonIds: ReadonlySet<string>,
): ContinueLearningTarget | null {
  const path = learningPathId ? LEARNING_PATHS_BY_ID[learningPathId] : undefined
  const subjectOrder = path?.subjectIds ?? Object.keys(SUBJECTS_BY_ID)

  for (const subjectId of subjectOrder) {
    const subject = SUBJECTS_BY_ID[subjectId]
    if (!subject) continue
    const lessons = getLessonsForSubject(subjectId)
    const next = lessons.find((lesson) => !completedLessonIds.has(lesson.id))
    if (next) {
      return { subject, lesson: next, isFirstLessonInSubject: lessons[0]?.id === next.id }
    }
  }
  return null
}
