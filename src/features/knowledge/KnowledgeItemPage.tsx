import { Link, useNavigate, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { KNOWLEDGE_ITEMS_BY_ID } from '@/data/content/knowledgeBase'
import { LESSONS_BY_ID } from '@/data/content/lessons'
import { renderMarkdownLite } from '@/utils/markdownLite'

export function KnowledgeItemPage() {
  const { itemId = '' } = useParams<{ itemId: string }>()
  const navigate = useNavigate()
  const item = KNOWLEDGE_ITEMS_BY_ID[itemId]

  if (!item)
    return (
      <EmptyState title="Not found" action={<Link to="/knowledge">Back to Knowledge Base</Link>} />
    )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 720 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{item.title}</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>{item.summary}</p>
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {item.tags.map((tag) => (
            <Badge key={tag} tone="neutral">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Card>
        <div style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-secondary)' }}>
          {renderMarkdownLite(item.content)}
        </div>
      </Card>

      {item.codeExamples.length > 0 ? (
        <Card>
          {item.codeExamples.map((example, index) => (
            <div key={index}>
              {example.caption ? (
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>
                  {example.caption}
                </div>
              ) : null}
              <pre
                style={{
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                  fontSize: 12.5,
                  overflowX: 'auto',
                }}
              >
                <code>{example.code}</code>
              </pre>
            </div>
          ))}
        </Card>
      ) : null}

      {item.relatedLessonIds.length > 0 ? (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Related lessons</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {item.relatedLessonIds.map((id) => {
              const lesson = LESSONS_BY_ID[id]
              if (!lesson) return null
              return (
                <Link
                  key={id}
                  to={`/learn/${lesson.subjectId}/${lesson.id}`}
                  style={{ color: 'var(--accent-primary)', fontSize: 13, fontWeight: 600 }}
                >
                  {lesson.title}
                </Link>
              )
            })}
          </div>
        </Card>
      ) : null}

      {item.externalLinks.length > 0 ? (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>External references</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {item.externalLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--accent-primary)', fontSize: 13, fontWeight: 600 }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </Card>
      ) : null}

      <Button variant="ghost" onClick={() => navigate('/knowledge')}>
        Back to Knowledge Base
      </Button>
    </div>
  )
}
