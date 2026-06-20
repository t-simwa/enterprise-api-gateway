import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Sidebar from '@/app/components/layout/sidebar'
import { useAuthStore } from '@/hooks/use-auth'

describe('layout', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'admin@example.com', full_name: 'Admin User', role: 'admin', created_at: '' },
      accessToken: 'mock-token',
      isAuthenticated: true,
    })
    window.location.hash = ''
  })

  it('test_responsive_sidebar', () => {
    const onToggle = () => {}
    const onMobileClose = () => {}
    const { container } = render(
      <BrowserRouter>
        <Sidebar collapsed={false} onToggle={onToggle} mobileOpen={false} onMobileClose={onMobileClose} />
      </BrowserRouter>,
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Inventory')).toBeInTheDocument()
    expect(screen.getByText('Orders')).toBeInTheDocument()
    expect(screen.getAllByText('Analytics').length).toBeGreaterThanOrEqual(1)
  })

  it('test_keyboard_shortcuts', async () => {
    const user = userEvent.setup()
    const navigate = () => {}
    render(
      <MemoryRouter initialEntries={['/']}>
        <Sidebar collapsed={false} onToggle={() => {}} mobileOpen={false} onMobileClose={() => {}} />
      </MemoryRouter>,
    )
    await user.keyboard('?')
    await screen.findByRole('dialog', { name: /keyboard shortcuts/i })
    expect(screen.getByText(/go to dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/go to products/i)).toBeInTheDocument()
    expect(screen.getByText(/go to inventory/i)).toBeInTheDocument()
    expect(screen.getByText(/go to orders/i)).toBeInTheDocument()
    expect(screen.getByText(/go to analytics/i)).toBeInTheDocument()
  })
})
