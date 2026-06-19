import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: { value: number; isUp: boolean }
  color?: 'brand' | 'danger' | 'warning' | 'success'
  loading?: boolean
  className?: string
}

const colorConfig = {
  brand: { bg: 'bg-blue-50 dark:bg-blue-950/20', icon: 'text-blue-600 dark:text-blue-400' },
  danger: { bg: 'bg-red-50 dark:bg-red-950/20', icon: 'text-red-600 dark:text-red-400' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-950/20', icon: 'text-amber-600 dark:text-amber-400' },
  success: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', icon: 'text-emerald-600 dark:text-emerald-400' },
}

export default function KpiCard({ label, value, icon, trend, color = 'brand', loading, className }: KpiCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const prevValue = useRef(0)
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) || 0 : value

  useEffect(() => {
    if (loading) return
    const start = prevValue.current
    const end = numericValue
    const duration = 800
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(start + (end - start) * eased)
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
    prevValue.current = end
  }, [numericValue, loading])

  const formatValue = (v: number) => {
    if (typeof value === 'string' && value.startsWith('$')) return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`
    return Math.round(v).toLocaleString()
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm animate-shimmer" style={{ height: '150px' }} />
    )
  }

  const cfg = colorConfig[color]

  return (
    <div className={cn('rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm', className)}>
      <div className="flex items-center justify-between mb-3">
        {icon ? (
          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', cfg.bg)}>
            <span className={cn('w-5 h-5', cfg.icon)}>{icon}</span>
          </div>
        ) : (
          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', cfg.bg)}>
            <div className={cn('w-5 h-5 rounded-full', cfg.icon.replace('text-', 'bg-').replace('-600', '-500').replace('-400', '-500'))} style={{ opacity: 0.2 }} />
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-[var(--color-text)] font-mono tabular-nums">
        {formatValue(displayValue)}
      </div>
      <div className="text-sm text-[var(--color-text-secondary)] mt-1">{label}</div>
      {trend && (
        <div className="inline-flex items-center gap-1 mt-2">
          <span className={trend.isUp ? 'text-emerald-500' : 'text-red-500'}>
            {trend.isUp ? '\u2191' : '\u2193'}
          </span>
          <span className={cn('text-sm', trend.isUp ? 'text-emerald-500' : 'text-red-500')}>
            {trend.value}%
          </span>
          <span className="text-xs text-[var(--color-text-tertiary)]">vs last period</span>
        </div>
      )}
    </div>
  )
}

export { KpiCard }
