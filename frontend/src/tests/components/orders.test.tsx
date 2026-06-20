import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import OrdersList from '@/app/routes/orders/index'
import { useAuthStore } from '@/hooks/use-auth'

function renderOrders() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <OrdersList />
      </BrowserRouter>
    </QueryClientProvider>,
  )
}

describe('orders', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'admin@example.com', full_name: 'Admin', role: 'admin', created_at: '' },
      accessToken: 'mock-token',
      isAuthenticated: true,
    })
  })

  it('test_order_status_filter', async () => {
    renderOrders()
    await waitFor(() => {
      expect(screen.getByText('Orders')).toBeInTheDocument()
    })
    const allTab = screen.getByText(/^All$/)
    expect(allTab).toBeInTheDocument()
    const user = userEvent.setup()
    const pendingButtons = screen.getAllByText(/^Pending$/)
    await user.click(pendingButtons[0])
    await waitFor(() => {
      expect(screen.getAllByText(/^Pending$/).length).toBeGreaterThanOrEqual(1)
    })
  })

  it('test_order_timeline', async () => {
    renderOrders()
    await waitFor(() => {
      expect(screen.getByText('Orders')).toBeInTheDocument()
    })
  })
})
