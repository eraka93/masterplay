import { useMemo } from 'react'

import type { SubjectSlug } from '@/models'
import * as progressService from '@/services/progressService'

import { useAuth } from './useAuth'
import { useRepositories } from './useRepositories'

/** Binds the progress service's action functions to the current user's uid + repositories. */
export function useProgressActions() {
  const { uid } = useAuth()
  const repos = useRepositories()

  return useMemo(
    () => ({
      recordAppOpen: () => progressService.recordAppOpen(uid, repos),
      completeLesson: (lessonId: string, lessonTitle: string, subjectId: SubjectSlug) =>
        progressService.completeLesson(uid, repos, lessonId, lessonTitle, subjectId),
      submitQuizAttempt: (
        attempt: Parameters<typeof progressService.submitQuizAttempt>[2],
        quizTitle: string,
        subjectId: SubjectSlug,
      ) => progressService.submitQuizAttempt(uid, repos, attempt, quizTitle, subjectId),
      completeChallenge: (
        attempt: Parameters<typeof progressService.completeChallenge>[2],
        challenge: Parameters<typeof progressService.completeChallenge>[3],
      ) => progressService.completeChallenge(uid, repos, attempt, challenge),
      logRealWorldProblem: (problem: Parameters<typeof progressService.logRealWorldProblem>[2]) =>
        progressService.logRealWorldProblem(uid, repos, problem),
      logEngineeringDecision: (
        decision: Parameters<typeof progressService.logEngineeringDecision>[2],
      ) => progressService.logEngineeringDecision(uid, repos, decision),
    }),
    [uid, repos],
  )
}
