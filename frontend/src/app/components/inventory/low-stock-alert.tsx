import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle, ChevronDown, ChevronRight, ShoppingCart } from 'lucide-react'
import type { LowStockItem } from '@/types'

interface LowStockAlertProps {
  items: LowStockItem[]
  loading?: boolean
}

export default function LowStockAlert({ items, loading }: LowStockAlertProps) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(true)

  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="animate-shimmer h-6 w-48 rounded" />
        <div className="space-y-3 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-shimmer h-12 rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10 p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            All products are well-stocked
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Low Stock Alerts
          </span>
          <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-amber-200/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            {items.length}
          </span>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-amber-600" /> : <ChevronRight className="w-4 h-4 text-amber-600" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {items.slice(0, 5).map((item) => (
            <div
              key={item.product_id}
              className="flex items-center justify-between p-3 rounded-md bg-white dark:bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
              onClick={() => navigate(`/products/${item.product_id}`)}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--color-text)] truncate">{item.name}</p>
                <p className="text-xs font-mono text-[var(--color-text-tertiary)]">{item.sku}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                <div className="text-right">
                  <p className="text-sm font-mono font-bold text-red-500">{item.total_qty}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">reorder at {item.reorder_point}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/orders/new?product=${item.product_id}`) }}
                  className="p-1.5 rounded hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] hover:text-[var(--color-brand)]"
                  title="Order now"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
