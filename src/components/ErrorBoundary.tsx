import { Component, type ErrorInfo, type ReactNode } from 'react'

import { Button } from './ui/Button'
import { EmptyState } from './ui/EmptyState'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Top-level catch-all so a bug in one feature (e.g. a malformed lesson block) doesn't take down
 * the whole app. Feature-level boundaries can wrap individual routes the same way if needed.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  override render() {
    if (this.state.error) {
      return (
        <EmptyState
          title="Something went wrong"
          description={this.state.error.message}
          action={
            <Button variant="primary" onClick={() => this.setState({ error: null })}>
              Try again
            </Button>
          }
        />
      )
    }
    return this.props.children
  }
}
