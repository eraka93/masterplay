import type { SubjectSlug } from './content'

export type ChallengeType =
  | 'multiple-choice'
  | 'find-the-bug'
  | 'predict-the-output'
  | 'architecture-decision'
  | 'debugging-scenario'
  | 'performance-problem'
  | 'code-review'
  | 'refactor-challenge'
  | 'system-design'

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard'

export interface ChallengeApproach {
  id: string
  title: string
  description: string
  /** Whether this approach is presented as the strongest recommended one, once revealed. */
  recommended?: boolean
}

export interface Challenge {
  id: string
  type: ChallengeType
  subjectId: SubjectSlug
  difficulty: ChallengeDifficulty
  title: string
  /** The scenario, shown before any answer/approach is revealed. */
  prompt: string
  context?: string
  code?: string
  language?: string
  /** Guiding questions shown to prompt investigation before revealing approaches. */
  investigationPrompts: string[]
  approaches: ChallengeApproach[]
  resolution: string
  tags: string[]
  xpReward: number
}

export interface ChallengeAttempt {
  id: string
  challengeId: string
  userId: string
  startedAt: string
  completedAt: string
  /** Free-form reasoning the user captured before revealing the resolution. */
  userReasoning?: string
  selectedApproachId?: string
  matchedRecommended: boolean
}
