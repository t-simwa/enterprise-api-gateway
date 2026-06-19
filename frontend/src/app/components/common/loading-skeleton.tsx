import { cn } from '@/lib/utils'

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6',
        className,
      )}
      style={{ height: '200px' }}
    />
  )
}

function SkeletonRow({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-shimmer w-full rounded-md', className)}
      style={{ height: '40px' }}
    />
  )
}

function SkeletonChart({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-shimmer w-full rounded-lg', className)}
      style={{ height: '300px' }}
    />
  )
}

function SkeletonText({ width = '60%', className }: { width?: string; className?: string }) {
  return (
    <div
      className={cn('animate-shimmer rounded-md', className)}
      style={{ height: '20px', width }}
    />
  )
}

export { SkeletonCard, SkeletonRow, SkeletonChart, SkeletonText }
