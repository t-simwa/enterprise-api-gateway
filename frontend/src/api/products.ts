import { apiClient } from './client'
import type { Product, ProductCreate, ProductUpdate, PaginatedResponse } from '@/types'

export const productsApi = {
  list: (params?: { page?: number; size?: number; category?: string; search?: string; sort?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.size) searchParams.set('size', String(params.size))
    if (params?.category) searchParams.set('category', params.category)
    if (params?.search) searchParams.set('search', params.search)
    if (params?.sort) searchParams.set('sort', params.sort)
    return apiClient.get('api/products', { searchParams }).json<PaginatedResponse<Product>>()
  },
  get: (id: string) =>
    apiClient.get(`api/products/${id}`).json<Product>(),
  create: (data: ProductCreate) =>
    apiClient.post('api/products', { json: data }).json<Product>(),
  update: (id: string, data: ProductUpdate) =>
    apiClient.put(`api/products/${id}`, { json: data }).json<Product>(),
  delete: (id: string) =>
    apiClient.delete(`api/products/${id}`),
}
