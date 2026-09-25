import { isFirebaseConfigured } from '@/firebase/config'
import type {
  Activity,
  Bookmark,
  ChallengeAttempt,
  EngineeringDecision,
  Goal,
  Note,
  NotificationToken,
  QuizAttempt,
  RealWorldProblem,
  ReviewScheduleEntry,
  StudySession,
  UserAchievement,
  UserProfile,
} from '@/models'

import { createFirestoreCollectionRepository } from './firestore/firestoreCollectionRepository'
import { createFirestoreDocRepository } from './firestore/firestoreDocRepository'
import { createLocalCollectionRepository } from './local/localCollectionRepository'
import { createLocalDocRepository } from './local/localDocRepository'
import type { CollectionRepository, DocRepository } from './types'

/** The fixed identity used for all local/offline data when no Firebase user is signed in. */
export const LOCAL_DEV_UID = 'local-dev-user'

function collectionRepo<T extends { id: string }>(
  uid: string,
  name: string,
): CollectionRepository<T> {
  return isFirebaseConfigured
    ? createFirestoreCollectionRepository<T>(uid, name)
    : createLocalCollectionRepository<T>(uid, name)
}

function docRepo<T extends object>(uid: string, name: string): DocRepository<T> {
  return isFirebaseConfigured
    ? createFirestoreDocRepository<T>(uid, name)
    : createLocalDocRepository<T>(uid, name)
}

/**
 * All per-user repositories for a given uid. Content repositories (subjects/lessons/quizzes/
 * challenges) are intentionally not here — see src/data/content for why that content is static
 * and bundled rather than fetched.
 */
export function createRepositories(uid: string) {
  return {
    userProfile: docRepo<UserProfile>(uid, 'main'),
    activities: collectionRepo<Activity>(uid, 'activities'),
    studySessions: collectionRepo<StudySession>(uid, 'studySessions'),
    goals: collectionRepo<Goal>(uid, 'goals'),
    notes: collectionRepo<Note>(uid, 'notes'),
    bookmarks: collectionRepo<Bookmark>(uid, 'bookmarks'),
    quizAttempts: collectionRepo<QuizAttempt>(uid, 'quizAttempts'),
    challengeAttempts: collectionRepo<ChallengeAttempt>(uid, 'challengeAttempts'),
    realWorldProblems: collectionRepo<RealWorldProblem>(uid, 'realWorldProblems'),
    engineeringDecisions: collectionRepo<EngineeringDecision>(uid, 'engineeringDecisions'),
    userAchievements: collectionRepo<UserAchievement & { id: string }>(uid, 'userAchievements'),
    reviewSchedule: collectionRepo<ReviewScheduleEntry>(uid, 'reviewSchedule'),
    notificationTokens: collectionRepo<NotificationToken>(uid, 'notificationTokens'),
  }
}

export type Repositories = ReturnType<typeof createRepositories>
