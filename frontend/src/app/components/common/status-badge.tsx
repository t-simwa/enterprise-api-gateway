import * as React from 'react'
import { cn } from '@/lib/utils'
import { statusColors } from '@/lib/design-tokens'

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
}

const statusBg: Record<string, string> = {
  pending: 'bg-amber-50 dark:bg-amber-950/20',
  confirmed: 'bg-blue-50 dark:bg-blue-950/20',
  processing: 'bg-indigo-50 dark:bg-indigo-950/20',
  shipped: 'bg-purple-50 dark:bg-purple-950/20',
  delivered: 'bg-emerald-50 dark:bg-emerald-950/20',
  cancelled: 'bg-red-50 dark:bg-red-950/20',
  returned: 'bg-slate-50 dark:bg-slate-950/20',
}

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const color = statusColors[status] || statusColors.pending
  const label = statusLabels[status] || status
  const bgClass = statusBg[status] || statusBg.pending

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        bgClass,
        className,
      )}
      {...props}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}

export { StatusBadge }
