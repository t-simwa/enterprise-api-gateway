import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex items-center justify-center p-16">
          <div className="max-w-sm text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-[var(--color-danger)]" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Something went wrong</h2>
            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-[var(--color-brand)] text-white rounded-md text-sm font-medium hover:bg-[var(--color-brand-hover)] transition-colors"
              >
                Try again
              </button>
              <a
                href="/"
                className="px-4 py-2 border border-[var(--color-border)] rounded-md text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
