import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { OrderEvent } from '@/types'

const statusDotColors: Record<string, string> = {
  pending: 'bg-amber-500 border-amber-500',
  confirmed: 'bg-blue-500 border-blue-500',
  processing: 'bg-indigo-500 border-indigo-500',
  shipped: 'bg-purple-500 border-purple-500',
  delivered: 'bg-emerald-500 border-emerald-500',
  cancelled: 'bg-red-500 border-red-500',
  returned: 'bg-slate-500 border-slate-500',
}

const statusBgColors: Record<string, string> = {
  pending: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900',
  confirmed: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900',
  processing: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900',
  shipped: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900',
  delivered: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900',
  cancelled: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900',
  returned: 'bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-900',
}

interface OrderTimelineProps {
  events: OrderEvent[]
  currentStatus?: string
}

export default function OrderTimeline({ events, currentStatus }: OrderTimelineProps) {
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [events],
  )

  if (sortedEvents.length === 0) {
    return (
      <div className="text-sm text-[var(--color-text-tertiary)] italic py-4 text-center">
        No status history yet
      </div>
    )
  }

  return (
    <div className="relative pl-8">
      <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-[var(--color-border)]" />
      <div className="space-y-6">
        {sortedEvents.map((event, i) => {
          const dotColor = statusDotColors[event.to_status] || 'bg-gray-400 border-gray-400'
          const bgColor = statusBgColors[event.to_status] || 'bg-gray-50 dark:bg-gray-950/20'
          const isCurrent = event.to_status === currentStatus

          return (
            <div
              key={event.id}
              className="relative animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className={cn(
                  'absolute -left-8 top-1 w-3 h-3 rounded-full border-2',
                  dotColor,
                  isCurrent ? 'ring-2 ring-offset-2 ring-offset-[var(--color-surface)]' : 'opacity-70',
                )}
              />
              <div className={cn('rounded-md p-3 border', bgColor, 'border')}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-[var(--color-text)] capitalize">{event.to_status}</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">
                    {new Date(event.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                {event.created_by_name && (
                  <p className="text-xs text-[var(--color-text-secondary)]">{event.created_by_name}</p>
                )}
                {event.notes && (
                  <p className="text-sm text-[var(--color-text)] mt-1">{event.notes}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
