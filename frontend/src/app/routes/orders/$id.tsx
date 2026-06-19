import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { ordersApi } from '@/api/orders'
import { StatusBadge } from '@/app/components/common/status-badge'
import OrderTimeline from '@/app/components/orders/order-timeline'
import ErrorBoundary from '@/app/components/common/error-boundary'
import { SkeletonCard, SkeletonRow, SkeletonText } from '@/app/components/common/loading-skeleton'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import type { OrderEvent } from '@/types'

const validTransitions: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped: ['delivered'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [transitioning, setTransitioning] = useState(false)

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.get(id!),
    enabled: !!id,
  })

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return
    setTransitioning(true)
    try {
      if (newStatus === 'cancelled' && confirmText !== 'CANCEL') {
        toast.error('Type "CANCEL" to confirm')
        setTransitioning(false)
        return
      }
      await ordersApi.updateStatus(id!, newStatus)
      toast.success(`Order ${newStatus}`)
      setConfirmOpen(false)
      setConfirmText('')
      refetch()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setTransitioning(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 max-w-[var(--content-max-width)] mx-auto">
        <SkeletonText width="200px" className="mb-4" />
        <SkeletonCard className="mb-4" />
        <SkeletonRow className="mb-2" />
        <SkeletonRow className="mb-2" />
        <SkeletonRow />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-8 max-w-[var(--content-max-width)] mx-auto">
        <p className="text-sm text-[var(--color-text-secondary)]">Order not found</p>
      </div>
    )
  }

  const transitions = validTransitions[order.status] || []
  const timelineEvents = order.items.flatMap(() => [] as OrderEvent[])

  return (
    <ErrorBoundary>
      <div className="p-8 max-w-[var(--content-max-width)] mx-auto">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>

        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">
            Order #{order.order_number}
          </h1>
          <StatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-6">
          <div className="space-y-6">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">Customer</h3>
              <p className="text-base font-medium text-[var(--color-text)]">{order.customer_name}</p>
              {order.customer_email && (
                <p className="text-sm text-[var(--color-brand)] hover:underline cursor-pointer">{order.customer_email}</p>
              )}
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Ordered {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
              <div className="p-4 border-b border-[var(--color-border)]">
                <h3 className="text-sm font-semibold text-[var(--color-text)]">Line Items</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--color-bg-secondary)]">
                    <th className="text-left px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">SKU</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Product</th>
                    <th className="text-center px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase" style={{ width: 60 }}>Qty</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase" style={{ width: 100 }}>Unit Price</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase" style={{ width: 100 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-t border-[var(--color-border)] h-10">
                      <td className="px-4 font-mono text-xs text-[var(--color-text-secondary)]">{item.sku}</td>
                      <td className="px-4 text-sm text-[var(--color-text)]">{item.product_name}</td>
                      <td className="px-4 text-center text-sm">{item.quantity}</td>
                      <td className="px-4 text-right font-mono tabular-nums text-sm">${item.unit_price.toFixed(2)}</td>
                      <td className="px-4 text-right font-mono tabular-nums text-sm font-medium">${item.total_price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[var(--color-border)]">
                    <td colSpan={4} className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-text)]">Total</td>
                    <td className="px-4 py-3 text-right text-lg font-bold text-[var(--color-text)] font-mono tabular-nums">
                      ${order.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">Notes</h3>
              <textarea
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none mb-3"
                placeholder="Add internal note..."
              />
              <Button variant="secondary" size="sm" className="h-8">Add Note</Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[var(--color-text)]">Status</h3>
                <StatusBadge status={order.status} />
              </div>

              {transitions.length > 0 && (
                <div className="space-y-3">
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value === 'cancelled') {
                        setConfirmOpen(true)
                      } else {
                        handleStatusUpdate(e.target.value)
                      }
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="" disabled>Update status...</option>
                    {transitions.map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>

                  {confirmOpen && (
                    <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900 space-y-2">
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">
                        Type <span className="font-mono font-bold">CANCEL</span> to confirm cancellation
                      </p>
                      <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Type CANCEL"
                        className="h-9 font-mono text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={confirmText !== 'CANCEL' || transitioning}
                          onClick={() => handleStatusUpdate('cancelled')}
                        >
                          {transitioning ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm Cancel'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setConfirmOpen(false); setConfirmText('') }}>
                          Back
                        </Button>
                      </div>
                    </div>
                  )}

                  {order.status === 'confirmed' && (
                    <Button className="w-full h-10" onClick={() => handleStatusUpdate('processing')} disabled={transitioning}>
                      {transitioning ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Process Payment'}
                    </Button>
                  )}
                  {order.status === 'processing' && (
                    <Button variant="secondary" className="w-full h-10" onClick={() => handleStatusUpdate('shipped')} disabled={transitioning}>
                      {transitioning ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark Shipped'}
                    </Button>
                  )}
                  {order.status === 'shipped' && (
                    <Button variant="secondary" className="w-full h-10" onClick={() => handleStatusUpdate('delivered')} disabled={transitioning}>
                      {transitioning ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark Delivered'}
                    </Button>
                  )}
                  {order.status === 'delivered' && (
                    <Button variant="ghost" className="w-full h-10" onClick={() => handleStatusUpdate('returned')} disabled={transitioning}>
                      {transitioning ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Process Return'}
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Order Timeline</h3>
              <OrderTimeline events={timelineEvents} currentStatus={order.status} />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
