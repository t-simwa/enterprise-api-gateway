import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import InventoryPage from '@/app/routes/inventory/index'
import { useAuthStore } from '@/hooks/use-auth'

function renderInventory() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <InventoryPage />
      </BrowserRouter>
    </QueryClientProvider>,
  )
}

describe('inventory', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'admin@example.com', full_name: 'Admin', role: 'admin', created_at: '' },
      accessToken: 'mock-token',
      isAuthenticated: true,
    })
  })

  it('test_inventory_stock_display', async () => {
    renderInventory()
    await waitFor(() => {
      expect(screen.getByText('Inventory')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByText('Stock Overview')).toBeInTheDocument()
      expect(screen.getByText('Warehouse Heatmap')).toBeInTheDocument()
    })
  })

  it('test_inventory_adjustment', async () => {
    renderInventory()
    await waitFor(() => {
      expect(screen.getByText('Inventory')).toBeInTheDocument()
    })
  })
})
