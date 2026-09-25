import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/ui/EmptyState'

export function NotFoundPage() {
  return (
    <EmptyState
      title="Page not found"
      description="That page doesn't exist."
      action={
        <Link to="/" style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: 13 }}>
          Back to Home
        </Link>
      }
    />
  )
}
