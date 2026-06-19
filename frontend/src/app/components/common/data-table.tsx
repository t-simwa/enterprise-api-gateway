import { useState, useMemo, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, ChevronsUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import EmptyState from './empty-state'

export interface Column<T> {
  key: string
  header: string
  accessor: (row: T) => ReactNode
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  total?: number
  page?: number
  pageSize?: number
  loading?: boolean
  emptyMessage?: string
  emptyIcon?: 'products' | 'orders' | 'inventory' | 'results' | 'default'
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  onSort?: (key: string, direction: 'asc' | 'desc' | null) => void
  onRowClick?: (row: T) => void
  density?: 'comfortable' | 'compact'
  selectedRows?: Set<string>
  onSelectedRowsChange?: (rows: Set<string>) => void
  rowKey: (row: T) => string
}

const PAGE_SIZES = [10, 25, 50, 100]

function DataTable<T>({
  columns,
  data,
  total = 0,
  page = 1,
  pageSize = 20,
  loading = false,
  emptyMessage,
  emptyIcon = 'default',
  onPageChange,
  onPageSizeChange,
  onSort,
  onRowClick,
  density: initialDensity,
  selectedRows,
  onSelectedRowsChange,
  rowKey,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null)
  const [density, setDensity] = useState<'comfortable' | 'compact'>(
    () => (localStorage.getItem('table-density') as 'comfortable' | 'compact') || 'comfortable',
  )

  const effectiveDensity = initialDensity || density

  const handleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
      onSort?.(key, 'asc')
    } else if (sortDir === 'asc') {
      setSortDir('desc')
      onSort?.(key, 'desc')
    } else {
      setSortKey(null)
      setSortDir(null)
      onSort?.(key, null)
    }
  }

  const toggleDensity = () => {
    const next = effectiveDensity === 'comfortable' ? 'compact' : 'comfortable'
    setDensity(next)
    localStorage.setItem('table-density', next)
  }

  const totalPages = Math.ceil(total / pageSize)
  const startItem = total > 0 ? (page - 1) * pageSize + 1 : 0
  const endItem = Math.min(page * pageSize, total)

  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('ellipsis')
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
      if (page < totalPages - 2) pages.push('ellipsis')
      pages.push(totalPages)
    }
    return pages
  }, [totalPages, page])

  const cellPadding = effectiveDensity === 'comfortable' ? 'py-3' : 'py-1.5'

  if (loading) {
    return (
      <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--color-bg-secondary)]">
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-2.5 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider text-left">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[var(--color-border)]">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 ${cellPadding}`}>
                      <div className="animate-shimmer h-4 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="border border-[var(--color-border)] rounded-lg">
        <EmptyState icon={emptyIcon} title={emptyMessage} />
      </div>
    )
  }

  return (
    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg-secondary)]">
              {selectedRows && (
                <th className="px-4 py-2.5 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-[var(--color-border)]"
                    checked={data.length > 0 && data.every((r) => selectedRows.has(rowKey(r)))}
                    onChange={(e) => {
                      if (e.target.checked) onSelectedRowsChange?.(new Set(data.map(rowKey)))
                      else onSelectedRowsChange?.(new Set())
                    }}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-2.5 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider',
                    col.sortable && 'cursor-pointer select-none hover:text-[var(--color-text)]',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    sortKey === col.key && 'text-[var(--color-brand)]',
                  )}
                  style={{ width: col.width, minWidth: col.width || '80px' }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> :
                      sortDir === 'desc' ? <ArrowDown className="w-3 h-3" /> :
                      <ChevronsUpDown className="w-3 h-3 opacity-50" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const key = rowKey(row)
              const isSelected = selectedRows?.has(key)
              return (
                <tr
                  key={key}
                  className={cn(
                    'border-b border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] transition-colors',
                    idx % 2 === 0 && 'bg-[var(--color-surface)]',
                    idx % 2 === 1 && 'bg-[var(--color-bg-secondary)] bg-opacity-50',
                    isSelected && 'bg-blue-50 dark:bg-blue-950/10',
                    onRowClick && 'cursor-pointer',
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectedRows && (
                    <td className="px-4 py-2.5">
                      <input
                        type="checkbox"
                        className="rounded border-[var(--color-border)]"
                        checked={isSelected || false}
                        onChange={(e) => {
                          const newSet = new Set(selectedRows)
                          if (e.target.checked) newSet.add(key)
                          else newSet.delete(key)
                          onSelectedRowsChange?.(newSet)
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 text-sm text-[var(--color-text)]',
                        cellPadding,
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right',
                      )}
                      style={{ width: col.width }}
                    >
                      {col.accessor(row)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] sticky bottom-0">
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--color-text-secondary)]">
            Showing {startItem} to {endItem} of {total} results
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-tertiary)]">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="h-7 text-xs border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)] px-1"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange?.(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {pageNumbers.map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`e${i}`} className="px-2 text-xs text-[var(--color-text-tertiary)]">...</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange?.(p)}
                className={cn(
                  'w-8 h-8 text-xs rounded hover:bg-[var(--color-bg-tertiary)]',
                  p === page && 'bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)]',
                  p !== page && 'text-[var(--color-text-secondary)]',
                )}
              >
                {p}
              </button>
            ),
          )}
          <button
            onClick={() => onPageChange?.(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={toggleDensity}
            className="ml-2 p-1.5 rounded hover:bg-[var(--color-bg-tertiary)] text-xs text-[var(--color-text-tertiary)]"
            title={`Switch to ${effectiveDensity === 'comfortable' ? 'compact' : 'comfortable'} view`}
          >
            {effectiveDensity === 'comfortable' ? 'Compact' : 'Comfortable'}
          </button>
        </div>
      </div>
    </div>
  )
}

export { DataTable }
