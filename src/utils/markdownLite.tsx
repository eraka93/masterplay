import type { ReactNode } from 'react'

/**
 * Deliberately not a full markdown renderer (avoiding a dependency for a handful of lesson-authoring
 * needs) — supports just what the lesson content in this app actually uses: **bold**, `code`,
 * paragraphs, and "- " bullet lists.
 */
export function renderMarkdownLite(markdown: string): ReactNode {
  const blocks = markdown.split(/\n\n+/)

  return blocks.map((block, blockIndex) => {
    const lines = block.split('\n')
    const isList = lines.every((line) => line.trim().startsWith('- ') || line.trim() === '')
    const isNumberedList = lines.every((line) => /^\d+\.\s/.test(line.trim()) || line.trim() === '')

    if (isList && lines.some((l) => l.trim())) {
      return (
        <ul
          key={blockIndex}
          style={{
            paddingLeft: 20,
            listStyle: 'disc',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {lines
            .filter((line) => line.trim())
            .map((line, lineIndex) => (
              <li key={lineIndex}>{renderInline(line.replace(/^-\s*/, ''))}</li>
            ))}
        </ul>
      )
    }

    if (isNumberedList && lines.some((l) => l.trim())) {
      return (
        <ol
          key={blockIndex}
          style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}
        >
          {lines
            .filter((line) => line.trim())
            .map((line, lineIndex) => (
              <li key={lineIndex}>{renderInline(line.replace(/^\d+\.\s*/, ''))}</li>
            ))}
        </ol>
      )
    }

    return <p key={blockIndex}>{renderInline(block)}</p>
  })
}

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9em' }}>
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}
