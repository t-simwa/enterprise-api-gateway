import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SkeletonCard, SkeletonRow, SkeletonChart, SkeletonText } from '@/app/components/common/loading-skeleton'
import ErrorBoundary from '@/app/components/common/error-boundary'
import EmptyState from '@/app/components/common/empty-state'

describe('common', () => {
  it('test_loading_skeleton', () => {
    const { container: cardContainer } = render(<SkeletonCard />)
    expect(cardContainer.querySelector('.animate-shimmer')).toBeInTheDocument()

    const { container: rowContainer } = render(<SkeletonRow />)
    expect(rowContainer.querySelector('.animate-shimmer')).toBeInTheDocument()

    const { container: chartContainer } = render(<SkeletonChart />)
    expect(chartContainer.querySelector('.animate-shimmer')).toBeInTheDocument()

    const { container: textContainer } = render(<SkeletonText />)
    expect(textContainer.querySelector('.animate-shimmer')).toBeInTheDocument()
  })

  it('test_error_boundary_catches', () => {
    const ThrowComponent = () => {
      throw new Error('Test error')
    }
    const { container } = render(
      <ErrorBoundary>
        <ThrowComponent />
      </ErrorBoundary>,
    )
    expect(container.textContent).toContain('Something went wrong')
  })

  it('test_empty_state_shows', () => {
    render(<EmptyState icon="default" title="No items found" />)
    expect(screen.getByText('No items found')).toBeInTheDocument()

    render(<EmptyState icon="results" title="No search results" description="Try a different query" />)
    expect(screen.getByText('No search results')).toBeInTheDocument()
    expect(screen.getByText('Try a different query')).toBeInTheDocument()

    render(<EmptyState icon="default" title="Error loading data" />)
    expect(screen.getByText('Error loading data')).toBeInTheDocument()

    const { container } = render(<EmptyState icon="default" title="No chart data" />)
    expect(container.textContent).toContain('No chart data')
  })
})
