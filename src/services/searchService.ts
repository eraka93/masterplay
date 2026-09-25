import { LESSONS } from '@/data/content/lessons'
import { KNOWLEDGE_ITEMS } from '@/data/content/knowledgeBase'
import { SUBJECTS_BY_ID } from '@/config/subjects'
import type { EngineeringDecision, RealWorldProblem } from '@/models'

export interface SearchResult {
  id: string
  kind: 'lesson' | 'knowledge' | 'problem' | 'decision'
  title: string
  subtitle: string
  href: string
}

function staticResults(): SearchResult[] {
  const lessonResults: SearchResult[] = LESSONS.map((lesson) => ({
    id: lesson.id,
    kind: 'lesson',
    title: lesson.title,
    subtitle: SUBJECTS_BY_ID[lesson.subjectId]?.title ?? 'Lesson',
    href: `/learn/${lesson.subjectId}/${lesson.id}`,
  }))

  const knowledgeResults: SearchResult[] = KNOWLEDGE_ITEMS.map((item) => ({
    id: item.id,
    kind: 'knowledge',
    title: item.title,
    subtitle: item.summary,
    href: `/knowledge/${item.id}`,
  }))

  return [...lessonResults, ...knowledgeResults]
}

/** Combines static content (bundled) with the user's own logged problems/decisions (repo-backed). */
export function buildSearchIndex(
  problems: RealWorldProblem[],
  decisions: EngineeringDecision[],
): SearchResult[] {
  const problemResults: SearchResult[] = problems.map((problem) => ({
    id: problem.id,
    kind: 'problem',
    title: problem.title,
    subtitle: 'Real-world problem',
    href: `/problems/${problem.id}`,
  }))

  const decisionResults: SearchResult[] = decisions.map((decision) => ({
    id: decision.id,
    kind: 'decision',
    title: decision.title,
    subtitle: 'Engineering decision',
    href: `/decisions/${decision.id}`,
  }))

  return [...staticResults(), ...problemResults, ...decisionResults]
}

export function searchIndex(index: SearchResult[], query: string): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return index
    .filter(
      (entry) => entry.title.toLowerCase().includes(q) || entry.subtitle.toLowerCase().includes(q),
    )
    .slice(0, 20)
}
