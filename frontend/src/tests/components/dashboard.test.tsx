import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import Dashboard from '@/app/routes/index'
import { useAuthStore } from '@/hooks/use-auth'
import { server } from '@/test/mocks/server'

function renderDashboard() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    </QueryClientProvider>,
  )
}

describe('dashboard', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'admin@example.com', full_name: 'Admin', role: 'admin', created_at: '' },
      accessToken: 'mock-token',
      isAuthenticated: true,
    })
  })

  it('test_dashboard_kpis_load', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Total Products')).toBeInTheDocument()
      expect(screen.getByText('Low Stock Items')).toBeInTheDocument()
      expect(screen.getByText('Pending Orders')).toBeInTheDocument()
      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    })
  })

  it('test_dashboard_kpis_error', async () => {
    server.use(
      http.get('*/api/orders/dashboard', () =>
        HttpResponse.json({ error: 'Server error' }, { status: 500 }),
      ),
    )
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })
})
