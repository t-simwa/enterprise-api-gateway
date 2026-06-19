import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { DataTable, type Column } from '@/app/components/common/data-table'
import { StatusBadge } from '@/app/components/common/status-badge'
import type { Order } from '@/types'

interface OrderTableProps {
  orders: Order[]
  total: number
  page: number
  pageSize: number
  loading: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export default function OrderTable({
  orders, total, page, pageSize, loading, onPageChange, onPageSizeChange,
}: OrderTableProps) {
  const navigate = useNavigate()

  const columns: Column<Order>[] = [
    {
      key: 'order_number',
      header: 'Order #',
      accessor: (row) => (
        <span className="font-mono text-sm text-[var(--color-brand)] hover:underline cursor-pointer">{row.order_number}</span>
      ),
      sortable: true,
      width: '100px',
    },
    {
      key: 'customer',
      header: 'Customer',
      accessor: (row) => (
        <div>
          <span className="text-sm text-[var(--color-text)] block truncate max-w-[160px]">{row.customer_name}</span>
          {row.customer_email && (
            <span className="text-xs text-[var(--color-text-tertiary)] truncate block max-w-[160px]">{row.customer_email}</span>
          )}
        </div>
      ),
      width: '160px',
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
      width: '120px',
    },
    {
      key: 'items',
      header: 'Items',
      accessor: (row) => (
        <span className="text-sm text-[var(--color-text-secondary)]">{row.items.length} items</span>
      ),
      align: 'center',
      width: '80px',
    },
    {
      key: 'total_amount',
      header: 'Total',
      accessor: (row) => (
        <span className="font-mono tabular-nums font-medium text-sm">
          ${row.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
      sortable: true,
      align: 'right',
      width: '120px',
    },
    {
      key: 'created_at',
      header: 'Date',
      accessor: (row) => (
        <span className="text-sm text-[var(--color-text-secondary)]">
          {new Date(row.created_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </span>
      ),
      sortable: true,
      width: '140px',
    },
    {
      key: 'actions',
      header: '',
      accessor: () => <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)]" />,
      width: '60px',
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={orders}
      total={total}
      page={page}
      pageSize={pageSize}
      loading={loading}
      emptyMessage="No orders yet"
      emptyIcon="orders"
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRowClick={(row) => navigate(`/orders/${row.id}`)}
      rowKey={(row) => row.id}
    />
  )
}
