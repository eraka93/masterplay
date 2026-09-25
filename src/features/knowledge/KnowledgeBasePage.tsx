import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { cardClassName } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { KNOWLEDGE_ITEMS } from '@/data/content/knowledgeBase'
import type { KnowledgeTag } from '@/models'

import styles from './KnowledgeBasePage.module.css'

export function KnowledgeBasePage() {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<KnowledgeTag | null>(null)

  const allTags = useMemo(() => {
    const tags = new Set<KnowledgeTag>()
    KNOWLEDGE_ITEMS.forEach((item) => item.tags.forEach((tag) => tags.add(tag)))
    return Array.from(tags).sort()
  }, [])

  const filtered = KNOWLEDGE_ITEMS.filter((item) => {
    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.summary.toLowerCase().includes(query.toLowerCase())
    const matchesTag = !activeTag || item.tags.includes(activeTag)
    return matchesQuery && matchesTag
  })

  return (
    <div className={styles.page}>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 640 }}>
        Your personal developer wiki — reusable answers, checklists, and cheat sheets pulled
        together from lessons and real debugging.
      </p>

      <div className={styles.searchRow}>
        <input
          className={styles.searchInput}
          placeholder="Search the knowledge base..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className={styles.tagRow}>
        <button
          className={`${styles.tagButton} ${activeTag === null ? styles.tagButtonActive : ''}`}
          onClick={() => setActiveTag(null)}
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            className={`${styles.tagButton} ${activeTag === tag ? styles.tagButtonActive : ''}`}
            onClick={() => setActiveTag(tag === activeTag ? null : tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No matching entries" description="Try a different search term or tag." />
      ) : (
        <div className={styles.grid}>
          {filtered.map((item) => (
            <Link
              key={item.id}
              to={`/knowledge/${item.id}`}
              className={cardClassName({ interactive: true, className: styles.card })}
            >
              <div className={styles.cardTitle}>{item.title}</div>
              <div className={styles.cardSummary}>{item.summary}</div>
              <div className={styles.cardTags}>
                {item.tags.map((tag) => (
                  <Badge key={tag} tone="neutral">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
