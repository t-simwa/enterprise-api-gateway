import { apiClient } from './client'
import type { Order, OrderCreate, DashboardData, PaginatedResponse } from '@/types'

export const ordersApi = {
  list: (params?: { page?: number; size?: number; status?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.size) searchParams.set('size', String(params.size))
    if (params?.status) searchParams.set('status', params.status)
    return apiClient.get('api/orders', { searchParams }).json<PaginatedResponse<Order>>()
  },
  get: (id: string) =>
    apiClient.get(`api/orders/${id}`).json<Order>(),
  create: (data: OrderCreate) =>
    apiClient.post('api/orders', { json: data }).json<Order>(),
  updateStatus: (id: string, status: string, notes?: string) =>
    apiClient.put(`api/orders/${id}/status`, { json: { status, notes } }).json<Order>(),
  cancel: (id: string) =>
    apiClient.post(`api/orders/${id}/cancel`).json<Order>(),
  returnOrder: (id: string) =>
    apiClient.post(`api/orders/${id}/return`).json<Order>(),
  dashboard: () =>
    apiClient.get('api/orders/dashboard').json<DashboardData>(),
  search: (q: string, params?: { page?: number; size?: number; status?: string }) => {
    const searchParams = new URLSearchParams({ q })
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.size) searchParams.set('size', String(params.size))
    if (params?.status) searchParams.set('status', params.status)
    return apiClient.get('api/orders/search', { searchParams }).json<PaginatedResponse<Order>>()
  },
}
