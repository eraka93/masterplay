import type { LessonBlock } from '@/models'
import { renderMarkdownLite } from '@/utils/markdownLite'

import styles from './LessonBlock.module.css'

export function LessonBlockRenderer({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case 'heading':
      return <div className={styles[`heading${block.level}`]}>{block.text}</div>

    case 'text':
      return <div className={styles.text}>{renderMarkdownLite(block.markdown)}</div>

    case 'code':
      return (
        <div className={styles.codeBlock}>
          {block.caption ? <div className={styles.codeCaption}>{block.caption}</div> : null}
          <pre className={styles.codePre}>
            <code>{block.code}</code>
          </pre>
        </div>
      )

    case 'image':
      return (
        <figure>
          <img
            src={block.src}
            alt={block.alt}
            style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)' }}
          />
          {block.caption ? (
            <figcaption className={styles.codeCaption}>{block.caption}</figcaption>
          ) : null}
        </figure>
      )

    case 'diagram':
      return (
        <div className={styles.diagram}>
          <div className={styles.diagramTitle}>{block.title}</div>
          <div className={styles.diagramNodes}>
            {block.nodes.map((node, index) => (
              <span
                key={index}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
              >
                <span className={styles.diagramNode}>{node}</span>
                {index < block.nodes.length - 1 ? (
                  <span className={styles.diagramArrow}>→</span>
                ) : null}
              </span>
            ))}
          </div>
          {block.description ? (
            <div className={styles.diagramDescription}>{block.description}</div>
          ) : null}
        </div>
      )

    case 'link':
      return (
        <a
          href={block.href}
          className={styles.linkBlock}
          target={block.href.startsWith('http') ? '_blank' : undefined}
          rel="noreferrer"
        >
          <span className={styles.linkBlockLabel}>{block.label}</span>
          {block.description ? (
            <span className={styles.linkBlockDescription}>{block.description}</span>
          ) : null}
        </a>
      )

    case 'doc-reference':
      return (
        <a href={block.href} className={styles.linkBlock} target="_blank" rel="noreferrer">
          <span className={styles.linkBlockLabel}>{block.label}</span>
          <span className={styles.linkBlockDescription}>{block.source}</span>
        </a>
      )

    case 'quote':
      return (
        <div className={`${styles.callout} ${styles.quote}`}>
          <div>
            “{block.quote}”
            {block.attribution ? (
              <div className={styles.diagramDescription}>— {block.attribution}</div>
            ) : null}
          </div>
        </div>
      )

    case 'tip':
      return (
        <div className={`${styles.callout} ${styles.tip}`}>
          <span className={styles.calloutLabel}>Tip</span>
          <span>{block.text}</span>
        </div>
      )

    case 'warning':
      return (
        <div className={`${styles.callout} ${styles.warning}`}>
          <span className={styles.calloutLabel}>Watch out</span>
          <span>{block.text}</span>
        </div>
      )

    case 'question':
      return <QuestionBlockView prompt={block.prompt} discussion={block.discussion} />

    case 'real-world-example':
      return (
        <div className={styles.realWorld}>
          <div className={styles.realWorldLabel}>Real-world example</div>
          <div className={styles.realWorldTitle}>{block.title}</div>
          <div className={styles.text}>{block.description}</div>
          {block.source ? <div className={styles.diagramDescription}>{block.source}</div> : null}
        </div>
      )

    default:
      return null
  }
}

function QuestionBlockView({ prompt, discussion }: { prompt: string; discussion: string }) {
  return (
    <details className={styles.question}>
      <summary className={styles.questionPrompt} style={{ cursor: 'pointer', listStyle: 'none' }}>
        {prompt}
      </summary>
      <div className={styles.questionDiscussion}>{discussion}</div>
    </details>
  )
}
