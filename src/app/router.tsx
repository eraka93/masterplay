import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { PageSpinner } from '@/components/ui/Spinner'
import { LoginGate } from '@/features/auth/LoginGate'
import { NotFoundPage } from '@/pages/NotFoundPage'

const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const RoadmapPage = lazy(() =>
  import('@/features/roadmap/RoadmapPage').then((m) => ({ default: m.RoadmapPage })),
)
const SubjectDetailPage = lazy(() =>
  import('@/features/roadmap/SubjectDetailPage').then((m) => ({ default: m.SubjectDetailPage })),
)
const LessonReaderPage = lazy(() =>
  import('@/features/lessons/LessonReaderPage').then((m) => ({ default: m.LessonReaderPage })),
)
const PracticeHubPage = lazy(() =>
  import('@/features/practice/PracticeHubPage').then((m) => ({ default: m.PracticeHubPage })),
)
const ChallengeDetailPage = lazy(() =>
  import('@/features/practice/ChallengeDetailPage').then((m) => ({
    default: m.ChallengeDetailPage,
  })),
)
const KnowledgeBasePage = lazy(() =>
  import('@/features/knowledge/KnowledgeBasePage').then((m) => ({ default: m.KnowledgeBasePage })),
)
const KnowledgeItemPage = lazy(() =>
  import('@/features/knowledge/KnowledgeItemPage').then((m) => ({ default: m.KnowledgeItemPage })),
)
const RealWorldProblemsPage = lazy(() =>
  import('@/features/problems/RealWorldProblemsPage').then((m) => ({
    default: m.RealWorldProblemsPage,
  })),
)
const RealWorldProblemDetailPage = lazy(() =>
  import('@/features/problems/RealWorldProblemDetailPage').then((m) => ({
    default: m.RealWorldProblemDetailPage,
  })),
)
const EngineeringDecisionsPage = lazy(() =>
  import('@/features/decisions/EngineeringDecisionsPage').then((m) => ({
    default: m.EngineeringDecisionsPage,
  })),
)
const EngineeringDecisionDetailPage = lazy(() =>
  import('@/features/decisions/EngineeringDecisionDetailPage').then((m) => ({
    default: m.EngineeringDecisionDetailPage,
  })),
)
const GoalsPage = lazy(() =>
  import('@/features/goals/GoalsPage').then((m) => ({ default: m.GoalsPage })),
)
const AchievementsPage = lazy(() =>
  import('@/features/achievements/AchievementsPage').then((m) => ({ default: m.AchievementsPage })),
)
const AnalyticsPage = lazy(() =>
  import('@/features/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })),
)
const SavedPage = lazy(() =>
  import('@/features/saved/SavedPage').then((m) => ({ default: m.SavedPage })),
)
const ProfilePage = lazy(() =>
  import('@/features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<PageSpinner />}>{node}</Suspense>
}

export const router = createBrowserRouter([
  {
    element: <LoginGate />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: withSuspense(<DashboardPage />) },
          { path: '/learn', element: withSuspense(<RoadmapPage />) },
          { path: '/learn/:subjectId', element: withSuspense(<SubjectDetailPage />) },
          { path: '/learn/:subjectId/:lessonId', element: withSuspense(<LessonReaderPage />) },
          { path: '/practice', element: withSuspense(<PracticeHubPage />) },
          { path: '/practice/:challengeId', element: withSuspense(<ChallengeDetailPage />) },
          { path: '/knowledge', element: withSuspense(<KnowledgeBasePage />) },
          { path: '/knowledge/:itemId', element: withSuspense(<KnowledgeItemPage />) },
          { path: '/problems', element: withSuspense(<RealWorldProblemsPage />) },
          { path: '/problems/:problemId', element: withSuspense(<RealWorldProblemDetailPage />) },
          { path: '/decisions', element: withSuspense(<EngineeringDecisionsPage />) },
          {
            path: '/decisions/:decisionId',
            element: withSuspense(<EngineeringDecisionDetailPage />),
          },
          { path: '/goals', element: withSuspense(<GoalsPage />) },
          { path: '/achievements', element: withSuspense(<AchievementsPage />) },
          { path: '/analytics', element: withSuspense(<AnalyticsPage />) },
          { path: '/saved', element: withSuspense(<SavedPage />) },
          { path: '/profile', element: withSuspense(<ProfilePage />) },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
