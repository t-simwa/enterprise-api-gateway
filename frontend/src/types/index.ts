export interface User {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface Product {
  id: string
  sku: string
  name: string
  description: string | null
  category: string | null
  unit_price: number
  unit_cost: number | null
  reorder_point: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductCreate {
  sku: string
  name: string
  description?: string
  category?: string
  unit_price: number
  unit_cost?: number
  reorder_point?: number
}

export interface ProductUpdate {
  name?: string
  description?: string
  category?: string
  unit_price?: number
  unit_cost?: number
  reorder_point?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface Warehouse {
  id: string
  code: string
  name: string
  location: string | null
  is_active: boolean
  created_at: string
}

export interface InventoryItem {
  warehouse_id: string
  warehouse_name: string
  warehouse_code: string
  quantity: number
  reserved_qty: number
  available_qty: number
}

export interface ProductInventory {
  product_id: string
  sku: string
  name: string
  total_qty: number
  total_reserved: number
  total_available: number
  warehouses: InventoryItem[]
}

export interface StockAdjustRequest {
  product_id: string
  warehouse_id: string
  change_qty: number
  reason: string
  notes?: string
}

export interface StockTransferRequest {
  product_id: string
  from_warehouse_id: string
  to_warehouse_id: string
  quantity: number
}

export interface OrderItemCreate {
  product_id: string
  quantity: number
}

export interface OrderCreate {
  customer_name: string
  customer_email?: string
  items: OrderItemCreate[]
}

export interface OrderItem {
  id: string
  product_id: string
  product_name: string
  sku: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface OrderEvent {
  id: string
  from_status: string | null
  to_status: string
  notes: string | null
  created_by_name: string | null
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string | null
  status: string
  total_amount: number
  notes: string | null
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface DashboardData {
  total_orders: number
  total_revenue: number
  avg_processing_hours: number
  orders_by_status: Record<string, number>
  orders_today: number
  pending_orders_count: number
  low_stock_count: number
}

export interface LowStockItem {
  product_id: string
  sku: string
  name: string
  category: string | null
  total_qty: number
  reorder_point: number
}
