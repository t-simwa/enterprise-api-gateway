import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Package } from 'lucide-react'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  index: number
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
}

export default function ProductCard({ product, index, onEdit, onDelete }: ProductCardProps) {
  const navigate = useNavigate()
  const stock = (product as Product & { total_qty?: number }).total_qty ?? 0
  const reorder = product.reorder_point

  const getStockStyle = () => {
    if (stock <= 0) return 'text-red-600 dark:text-red-400 font-semibold'
    if (stock < reorder) return 'text-amber-600 dark:text-amber-400'
    return 'text-emerald-600 dark:text-emerald-400'
  }

  const getStockLabel = () => {
    if (stock <= 0) return 'Critical'
    if (stock < reorder) return 'Low'
    return 'In Stock'
  }

  return (
    <div
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <div className="w-full h-28 rounded-md bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-bg-tertiary)] flex items-center justify-center mb-3">
        <Package className="w-10 h-10 text-[var(--color-text-tertiary)]" />
      </div>
      <h3 className="text-sm font-semibold text-[var(--color-text)] line-clamp-2 mb-1">
        {product.name}
      </h3>
      <p className="text-xs font-mono text-[var(--color-text-secondary)] mb-2">
        {product.sku}
      </p>
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-bold text-[var(--color-text)] font-mono tabular-nums">
          ${product.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
        <span className={`text-xs font-medium ${getStockStyle()}`}>
          {getStockLabel()} ({stock})
        </span>
      </div>
      {product.category && (
        <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]">
          {product.category}
        </span>
      )}
      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-[var(--color-border)] opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(product) }}
            className="p-1.5 rounded hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]"
            title="Edit product"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(product) }}
            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-[var(--color-text-tertiary)] hover:text-red-600"
            title="Delete product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
