import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { SearchIcon } from '@/components/ui/icons'
import { useRepositories } from '@/hooks/useRepositories'
import { buildSearchIndex, searchIndex, type SearchResult } from '@/services/searchService'

import styles from './GlobalSearch.module.css'

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const repos = useRepositories()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setQuery('')
    void (async () => {
      const [problems, decisions] = await Promise.all([
        repos.realWorldProblems.list(),
        repos.engineeringDecisions.list(),
      ])
      setIndex(buildSearchIndex(problems, decisions))
    })()
    const timer = setTimeout(() => inputRef.current?.focus(), 10)
    return () => clearTimeout(timer)
  }, [open, repos])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const results = searchIndex(index, query)

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(event) => event.stopPropagation()}>
        <div className={styles.inputRow}>
          <SearchIcon size={16} />
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Search lessons, knowledge base, problems, decisions..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className={styles.results}>
          {query && results.length === 0 ? (
            <div className={styles.empty}>No results for "{query}"</div>
          ) : null}
          {results.map((result) => (
            <button
              key={`${result.kind}-${result.id}`}
              className={styles.result}
              onClick={() => {
                onClose()
                navigate(result.href)
              }}
            >
              <span className={styles.resultTitle}>{result.title}</span>
              <span className={styles.resultSubtitle}>{result.subtitle}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
