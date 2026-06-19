import { useLocation, useNavigate } from 'react-router-dom'
import { House, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'

const routeLabels: Record<string, string> = {
  '': 'Home',
  products: 'Products',
  inventory: 'Inventory',
  orders: 'Orders',
  analytics: 'Analytics',
  settings: 'Settings',
  new: 'New',
  transfers: 'Transfers',
  batch: 'Batch Orders',
}

export default function Breadcrumbs() {
  const location = useLocation()
  const navigate = useNavigate()

  const segments = useMemo(() => {
    const pathParts = location.pathname.split('/').filter(Boolean)
    return pathParts.map((part, index) => {
      const path = '/' + pathParts.slice(0, index + 1).join('/')
      const isLast = index === pathParts.length - 1
      const label = routeLabels[part] || part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')
      return { label, path, isLast }
    })
  }, [location.pathname])

  if (segments.length === 0) {
    return (
      <div className="mb-4 py-1">
        <div className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
          <House className="w-4 h-4" />
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4 py-1">
      <nav aria-label="Breadcrumb" className="inline-flex items-center gap-1 text-sm">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors"
          aria-label="Home"
        >
          <House className="w-4 h-4" />
        </button>
        {segments.map((seg) => (
          <span key={seg.path} className="inline-flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
            {seg.isLast ? (
              <span className="text-[var(--color-text)] font-medium truncate max-w-[200px]">
                {seg.label}
              </span>
            ) : (
              <button
                onClick={() => navigate(seg.path)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors truncate max-w-[200px]"
              >
                {seg.label}
              </button>
            )}
          </span>
        ))}
      </nav>
    </div>
  )
}
