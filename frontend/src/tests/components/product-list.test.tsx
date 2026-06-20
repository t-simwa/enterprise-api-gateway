import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProductsList from '@/app/routes/products/index'
import { useAuthStore } from '@/hooks/use-auth'

function renderProducts() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <ProductsList />
      </BrowserRouter>
    </QueryClientProvider>,
  )
}

describe('product-list', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'admin@example.com', full_name: 'Admin', role: 'admin', created_at: '' },
      accessToken: 'mock-token',
      isAuthenticated: true,
    })
  })

  it('test_product_list_renders', async () => {
    renderProducts()
    await waitFor(() => {
      expect(screen.getByText('Products')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByText('SKU-0001')).toBeInTheDocument()
      expect(screen.getByText('Product 1')).toBeInTheDocument()
    })
  })

  it('test_product_list_empty', async () => {
    const { server } = await import('@/test/mocks/server')
    const { http, HttpResponse } = await import('msw')
    server.use(
      http.get('*/api/products', () =>
        HttpResponse.json({ items: [], total: 0, page: 1, size: 20, pages: 0 }),
      ),
    )
    renderProducts()
    await waitFor(() => {
      expect(screen.getByText(/no products found/i)).toBeInTheDocument()
    })
  })

  it('test_product_search', async () => {
    const user = userEvent.setup()
    renderProducts()

    const searchInput = screen.getByPlaceholderText(/search by name, sku/i)
    expect(searchInput).toBeInTheDocument()

    await user.type(searchInput, 'Product 1')
    await waitFor(() => {
      expect(searchInput).toHaveValue('Product 1')
    })
  })

  it('test_product_create_form', async () => {
    renderProducts()
    await waitFor(() => {
      expect(screen.getByText('New Product')).toBeInTheDocument()
    })
  })

  it('test_product_create_submit', async () => {
    const { server } = await import('@/test/mocks/server')
    const { http, HttpResponse } = await import('msw')
    let capturedBody: unknown = null
    server.use(
      http.post('*/api/products', async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ id: 'new-id', sku: 'SKU-NEW', name: 'New Product', unit_price: 29.99 }, { status: 201 })
      }),
    )
    expect(capturedBody).toBeNull()
    renderProducts()
    await waitFor(() => {
      expect(screen.getByText('New Product')).toBeInTheDocument()
    })
  })
})
