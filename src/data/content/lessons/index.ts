import type { Lesson } from '@/models'

import { fabricLesson } from './fabric'
import { hermesLesson } from './hermes'
import { javascriptEventLoopLesson } from './javascriptEventLoop'
import { jsiLesson } from './jsi'
import { reactNativeBridgeLesson } from './reactNativeBridge'
import { reactNativePerformanceLesson } from './reactNativePerformance'
import { reactReconciliationLesson } from './reactReconciliation'
import { turboModulesLesson } from './turbomodules'

export const LESSONS: Lesson[] = [
  javascriptEventLoopLesson,
  reactReconciliationLesson,
  reactNativeBridgeLesson,
  jsiLesson,
  hermesLesson,
  fabricLesson,
  turboModulesLesson,
  reactNativePerformanceLesson,
]

export const LESSONS_BY_ID: Record<string, Lesson> = Object.fromEntries(
  LESSONS.map((lesson) => [lesson.id, lesson]),
)

export function getLessonsForSubject(subjectId: string): Lesson[] {
  return LESSONS.filter((lesson) => lesson.subjectId === subjectId).sort(
    (a, b) => a.order - b.order,
  )
}
