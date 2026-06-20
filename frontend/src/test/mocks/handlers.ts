import { http, HttpResponse } from 'msw'

const mockUser = {
  id: 'u1',
  email: 'admin@example.com',
  full_name: 'Admin User',
  role: 'admin',
  created_at: '2026-01-01T00:00:00Z',
}

const mockProducts = Array.from({ length: 20 }, (_, i) => ({
  id: `p${i + 1}`,
  sku: `SKU-${String(i + 1).padStart(4, '0')}`,
  name: `Product ${i + 1}`,
  description: `Description for product ${i + 1}`,
  category: ['Electronics', 'Clothing', 'Food & Beverages', 'Home & Garden', 'Office Supplies'][i % 5],
  unit_price: 19.99 + i * 5,
  unit_cost: 10.0 + i * 2.5,
  reorder_point: 10 + (i % 5) * 5,
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}))

const mockInventory = (productId: string) => ({
  product_id: productId,
  sku: 'SKU-0001',
  name: 'Mock Product',
  total_qty: 50,
  total_reserved: 5,
  total_available: 45,
  warehouses: [
    { warehouse_id: 'w1', warehouse_name: 'Nairobi Central', warehouse_code: 'WH-NAI-01', quantity: 20, reserved_qty: 2, available_qty: 18 },
    { warehouse_id: 'w2', warehouse_name: 'Mombasa Port', warehouse_code: 'WH-MBA-01', quantity: 30, reserved_qty: 3, available_qty: 27 },
  ],
})

const mockLowStock = [
  { product_id: 'p3', sku: 'SKU-0003', name: 'Product 3', category: 'Food & Beverages', total_qty: 5, reorder_point: 15 },
  { product_id: 'p7', sku: 'SKU-0007', name: 'Product 7', category: 'Home & Garden', total_qty: 3, reorder_point: 10 },
]

const mockOrders = Array.from({ length: 15 }, (_, i) => ({
  id: `o${i + 1}`,
  order_number: `ORD-${String(i + 1).padStart(5, '0')}`,
  customer_name: `Customer ${i + 1}`,
  customer_email: `customer${i + 1}@example.com`,
  status: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'][i % 7],
  total_amount: 50 + i * 25.5,
  notes: null,
  items: [
    { id: `oi${i + 1}-1`, product_id: 'p1', product_name: 'Product 1', sku: 'SKU-0001', quantity: 2, unit_price: 25.0, total_price: 50.0 },
  ],
  created_at: '2026-06-15T10:30:00Z',
  updated_at: '2026-06-15T10:30:00Z',
}))

const mockDashboard = {
  total_orders: 45,
  total_revenue: 125000.0,
  avg_processing_hours: 4.5,
  orders_by_status: {
    pending: 12,
    confirmed: 8,
    processing: 5,
    shipped: 7,
    delivered: 10,
    cancelled: 2,
    returned: 1,
  },
  orders_today: 3,
  pending_orders_count: 12,
  low_stock_count: 2,
}

export const handlers = [
  http.post('*/auth/login', () => HttpResponse.json({
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    token_type: 'bearer',
  })),

  http.get('*/auth/me', () => HttpResponse.json(mockUser)),

  http.get('*/api/products', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const size = Number(url.searchParams.get('size') || '20')
    const search = url.searchParams.get('search') || ''
    const category = url.searchParams.get('category') || ''
    const sort = url.searchParams.get('sort') || ''

    let filtered = [...mockProducts]
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    }
    if (category) {
      filtered = filtered.filter((p) => p.category === category)
    }
    if (sort) {
      const desc = sort.startsWith('-')
      const key = desc ? sort.slice(1) : sort
      filtered.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
        const va = a[key] as string | number
        const vb = b[key] as string | number
        if (typeof va === 'string') return desc ? vb.localeCompare(va) : va.localeCompare(vb)
        return desc ? Number(vb) - Number(va) : Number(va) - Number(vb)
      })
    }

    const start = (page - 1) * size
    const items = filtered.slice(start, start + size)

    return HttpResponse.json({
      items,
      total: filtered.length,
      page,
      size,
      pages: Math.ceil(filtered.length / size),
    })
  }),

  http.get('*/api/products/:id', ({ params }) => {
    const product = mockProducts.find((p) => p.id === params.id)
    if (!product) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    return HttpResponse.json(product)
  }),

  http.post('*/api/products', () => HttpResponse.json(mockProducts[0], { status: 201 })),

  http.put('*/api/products/:id', ({ params }) => HttpResponse.json({ ...mockProducts[0], id: params.id })),

  http.delete('*/api/products/:id', () => new HttpResponse(null, { status: 204 })),

  http.get('*/api/inventory/low-stock', () => HttpResponse.json(mockLowStock)),

  http.get('*/api/inventory/:productId', ({ params }) => HttpResponse.json(mockInventory(params.productId as string))),

  http.post('*/api/inventory/adjust', () => HttpResponse.json({
    product_id: 'p1',
    warehouse_id: 'w1',
    quantity: 45,
    reserved_qty: 5,
    change_qty: -5,
    reason: 'Manual Count',
  })),

  http.post('*/api/inventory/transfer', () => HttpResponse.json({
    product_id: 'p1',
    from_warehouse_id: 'w1',
    to_warehouse_id: 'w2',
    quantity: 10,
    from_quantity: 10,
    to_quantity: 40,
  })),

  http.get('*/api/orders', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const size = Number(url.searchParams.get('size') || '20')
    const status = url.searchParams.get('status') || ''

    let filtered = [...mockOrders]
    if (status) filtered = filtered.filter((o) => o.status === status)

    const start = (page - 1) * size
    const items = filtered.slice(start, start + size)

    return HttpResponse.json({
      items,
      total: filtered.length,
      page,
      size,
      pages: Math.ceil(filtered.length / size),
    })
  }),

  http.get('*/api/orders/dashboard', () => HttpResponse.json(mockDashboard)),

  http.get('*/api/orders/:id', ({ params }) => {
    const order = mockOrders.find((o) => o.id === params.id)
    if (!order) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    return HttpResponse.json(order)
  }),

  http.put('*/api/orders/:id/status', () => HttpResponse.json({
    ...mockOrders[0],
    status: 'processing',
  })),

  http.post('*/api/orders/batch', () => HttpResponse.json({
    success_count: 3,
    failed_count: 0,
    errors: [],
  })),

  http.post('*/auth/refresh', () => HttpResponse.json({
    access_token: 'refreshed-mock-token',
    token_type: 'bearer',
  })),
]
