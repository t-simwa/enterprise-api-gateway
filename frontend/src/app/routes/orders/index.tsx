import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { ordersApi } from '@/api/orders'
import OrderTable from '@/app/components/orders/order-table'
import Breadcrumbs from '@/app/components/layout/breadcrumbs'
import { Button } from '@/app/components/ui/button'
import { ORDER_STATUSES } from '@/lib/constants'

const statusTabs = ['all', ...ORDER_STATUSES] as const

export default function OrdersList() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, pageSize, statusFilter],
    queryFn: () => ordersApi.list({ page, size: pageSize, status: statusFilter === 'all' ? undefined : statusFilter }),
  })

  const orders = data?.items ?? []
  const total = data?.total ?? 0

  const { data: dashboardData } = useQuery({
    queryKey: ['orders-dashboard-counts'],
    queryFn: () => ordersApi.dashboard(),
  })

  return (
    <div className="p-8 max-w-[var(--content-max-width)] mx-auto">
      <Breadcrumbs />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">Orders</h1>
        <Button variant="secondary" size="sm" className="h-9" onClick={() => navigate('/orders/batch')}>
          <Plus className="w-4 h-4 mr-1.5" /> Batch Create
        </Button>
      </div>

      <div className="flex items-center gap-1 mb-6 overflow-x-auto">
        {statusTabs.map((status) => {
          let count = 0
          if (dashboardData) {
            if (status === 'all') {
              count = dashboardData.total_orders
            } else {
              count = dashboardData.orders_by_status[status] ?? 0
            }
          }
          const isActive = statusFilter === status
          return (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1) }}
              className={`inline-flex items-center h-8 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm border border-[var(--color-border)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              {count > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-[var(--color-bg-secondary)]' : 'bg-[var(--color-bg-tertiary)]'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <OrderTable
        orders={orders}
        total={total}
        page={page}
        pageSize={pageSize}
        loading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
      />
    </div>
  )
}
