import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { DataTable, type Column } from '@/app/components/common/data-table'
import { Button } from '@/app/components/ui/button'
import type { Product } from '@/types'

function StockBadge({ product }: { product: Product }) {
  const stock = (product as Product & { total_qty?: number }).total_qty ?? 0
  const reorder = product.reorder_point

  if (stock <= 0) {
    return (
      <span className="inline-flex items-center h-6 px-2 rounded-md text-xs font-semibold bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
        Critical
      </span>
    )
  }
  if (stock < reorder) {
    return (
      <span className="inline-flex items-center h-6 px-2 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
        Low
      </span>
    )
  }
  return (
    <span className="inline-flex items-center h-6 px-2 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
      Well-stocked
    </span>
  )
}

interface ProductTableProps {
  products: Product[]
  total: number
  page: number
  pageSize: number
  loading: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onSort?: (key: string, direction: 'asc' | 'desc' | null) => void
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
}

export default function ProductTable({
  products, total, page, pageSize, loading,
  onPageChange, onPageSizeChange, onSort, onEdit, onDelete,
}: ProductTableProps) {
  const navigate = useNavigate()
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  const columns: Column<Product>[] = [
    {
      key: 'sku',
      header: 'SKU',
      accessor: (row) => <span className="font-mono text-xs font-medium">{row.sku}</span>,
      sortable: true,
      width: '120px',
    },
    {
      key: 'name',
      header: 'Name',
      accessor: (row) => (
        <span className="text-sm truncate block max-w-[200px]" title={row.name}>{row.name}</span>
      ),
      sortable: true,
    },
    {
      key: 'category',
      header: 'Category',
      accessor: (row) => (
        row.category
          ? <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]">{row.category}</span>
          : <span className="text-xs text-[var(--color-text-tertiary)]">—</span>
      ),
      sortable: true,
      width: '120px',
    },
    {
      key: 'unit_price',
      header: 'Unit Price',
      accessor: (row) => (
        <span className="font-mono tabular-nums text-sm text-right block">
          ${row.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
      sortable: true,
      align: 'right',
      width: '100px',
    },
    {
      key: 'stock',
      header: 'Stock',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden" style={{ maxWidth: 60 }}>
            <div
              className={`h-full rounded-full transition-all ${
                (row as Product & { total_qty?: number }).total_qty !== undefined
                  ? (row as Product & { total_qty?: number }).total_qty! <= 0
                    ? 'bg-red-500'
                    : (row as Product & { total_qty?: number }).total_qty! < row.reorder_point
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  : 'bg-[var(--color-brand)]'
              }`}
              style={{
                width: `${Math.min(100, ((row as Product & { total_qty?: number }).total_qty ?? 0) / Math.max(row.reorder_point, 1) * 100)}%`,
              }}
            />
          </div>
          <span className="font-mono tabular-nums text-xs">
            {(row as Product & { total_qty?: number }).total_qty ?? '—'}
          </span>
        </div>
      ),
      width: '100px',
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => <StockBadge product={row} />,
      width: '100px',
    },
    {
      key: 'actions',
      header: '',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(row) }}
              className="p-1.5 rounded hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors"
              title="Edit product"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(row) }}
              className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-[var(--color-text-tertiary)] hover:text-red-600 transition-colors"
              title="Delete product"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
      width: '80px',
    },
  ]

  return (
    <>
      {selectedRows.size > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] border-b-0 rounded-t-lg animate-slide-up">
          <span className="text-sm text-[var(--color-text-secondary)]">
            {selectedRows.size} selected
          </span>
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="sm" onClick={() => {
              selectedRows.forEach((id) => {
                const p = products.find((x) => x.id === id)
                if (p) onDelete?.(p)
              })
              setSelectedRows(new Set())
            }}>
              Delete Selected
            </Button>
          </div>
        </div>
      )}
      <DataTable
        columns={columns}
        data={products}
        total={total}
        page={page}
        pageSize={pageSize}
        loading={loading}
        emptyMessage="No products found"
        emptyIcon="products"
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onSort={onSort}
        onRowClick={(row) => navigate(`/products/${row.id}`)}
        rowKey={(row) => row.id}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
      />
    </>
  )
}
