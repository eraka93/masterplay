import { Link } from 'react-router-dom'

import { cardClassName } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import { LESSONS_BY_ID } from '@/data/content/lessons'
import { KNOWLEDGE_ITEMS_BY_ID } from '@/data/content/knowledgeBase'
import { useCollectionData } from '@/hooks/useCollectionData'

export function SavedPage() {
  const { items: bookmarks, loading: bookmarksLoading } = useCollectionData((repos) =>
    repos.bookmarks.list(),
  )
  const { items: problems, loading: problemsLoading } = useCollectionData((repos) =>
    repos.realWorldProblems.list(),
  )

  if (bookmarksLoading || problemsLoading) return <PageSpinner />

  const entries = bookmarks
    .map((bookmark) => {
      if (bookmark.targetType === 'lesson') {
        const lesson = LESSONS_BY_ID[bookmark.targetId]
        if (!lesson) return null
        return {
          id: bookmark.id,
          title: lesson.title,
          sub: 'Lesson',
          href: `/learn/${lesson.subjectId}/${lesson.id}`,
        }
      }
      if (bookmark.targetType === 'knowledge-item') {
        const item = KNOWLEDGE_ITEMS_BY_ID[bookmark.targetId]
        if (!item) return null
        return {
          id: bookmark.id,
          title: item.title,
          sub: 'Knowledge base',
          href: `/knowledge/${item.id}`,
        }
      }
      const problem = problems.find((p) => p.id === bookmark.targetId)
      if (!problem) return null
      return {
        id: bookmark.id,
        title: problem.title,
        sub: 'Real-world problem',
        href: `/problems/${problem.id}`,
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))

  if (entries.length === 0) {
    return (
      <EmptyState
        title="Nothing saved yet"
        description="Bookmark lessons, knowledge base entries, or problems to find them here."
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {entries.map((entry) => (
        <Link key={entry.id} to={entry.href} className={cardClassName({ interactive: true })}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{entry.title}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 2 }}>
            {entry.sub}
          </div>
        </Link>
      ))}
    </div>
  )
}
