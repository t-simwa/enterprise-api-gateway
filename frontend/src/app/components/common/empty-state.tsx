import { Package, ShoppingCart, Warehouse, SearchX, Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: 'products' | 'orders' | 'inventory' | 'results' | 'default'
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

const icons = {
  products: Package,
  orders: ShoppingCart,
  inventory: Warehouse,
  results: SearchX,
  default: Inbox,
}

const defaults: Record<string, { title: string; description: string; actionLabel?: string }> = {
  products: {
    title: 'No products yet',
    description: 'Create your first product to get started with inventory management.',
    actionLabel: 'Create Product',
  },
  orders: {
    title: 'No orders yet',
    description: 'Orders will appear here once customers start placing them.',
  },
  inventory: {
    title: 'No inventory data',
    description: 'Add products and warehouses to start tracking inventory.',
    actionLabel: 'Add Product',
  },
  results: {
    title: 'No results found',
    description: 'Try adjusting your search or filter to find what you are looking for.',
  },
  default: {
    title: 'Nothing here yet',
    description: 'Content will appear here once available.',
  },
}

export default function EmptyState({ icon = 'default', title, description, actionLabel, onAction }: EmptyStateProps) {
  const Icon = icons[icon]
  const def = defaults[icon]
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center">
        <Icon className="w-8 h-8 text-[var(--color-text-tertiary)]" />
      </div>
      <div className="text-center max-w-sm space-y-1">
        <h3 className="text-lg font-medium text-[var(--color-text)]">{title || def.title}</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">{description || def.description}</p>
      </div>
      {(actionLabel || def.actionLabel) && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-[var(--color-brand)] text-white rounded-md text-sm font-medium hover:bg-[var(--color-brand-hover)] transition-colors"
        >
          {actionLabel || def.actionLabel}
        </button>
      )}
    </div>
  )
}

export { EmptyState }
