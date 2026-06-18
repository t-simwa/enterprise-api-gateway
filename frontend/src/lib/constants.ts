export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZES: [10, 25, 50, 100],
} as const

export const ORDER_STATUSES = [
  'pending', 'confirmed', 'processing', 'shipped',
  'delivered', 'cancelled', 'returned',
] as const

export const PRODUCT_CATEGORIES = [
  'Electronics', 'Clothing', 'Food & Beverages',
  'Home & Garden', 'Office Supplies',
] as const

export const ROLES = ['admin', 'manager', 'viewer'] as const
