import { apiClient } from './client'
import type { ProductInventory, StockAdjustRequest, StockTransferRequest, LowStockItem, PaginatedResponse } from '@/types'

export const inventoryApi = {
  getByProduct: (productId: string) =>
    apiClient.get(`api/inventory/${productId}`).json<ProductInventory>(),
  adjust: (data: StockAdjustRequest) =>
    apiClient.post('api/inventory/adjust', { json: data }).json(),
  transfer: (data: StockTransferRequest) =>
    apiClient.post('api/inventory/transfer', { json: data }).json(),
  lowStock: (threshold?: number) => {
    const searchParams = new URLSearchParams()
    if (threshold !== undefined) searchParams.set('threshold', String(threshold))
    return apiClient.get('api/inventory/low-stock', { searchParams }).json<LowStockItem[]>()
  },
  auditLog: (params?: { page?: number; size?: number; product_id?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.size) searchParams.set('size', String(params.size))
    if (params?.product_id) searchParams.set('product_id', params.product_id)
    return apiClient.get('api/inventory/audit-log', { searchParams }).json<PaginatedResponse<unknown>>()
  },
}
