import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Warehouse, ShoppingCart, BarChart3, Settings,
  ChevronLeft, ChevronRight, LogOut, X,
} from 'lucide-react'
import { useAuthStore } from '@/hooks/use-auth'

interface NavItem {
  label: string
  icon: React.ReactNode
  path: string
  shortcut: string
  section: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/', shortcut: 'g+d', section: 'Main' },
  { label: 'Products', icon: <Package className="w-5 h-5" />, path: '/products', shortcut: 'g+p', section: 'Management' },
  { label: 'Inventory', icon: <Warehouse className="w-5 h-5" />, path: '/inventory', shortcut: 'g+i', section: 'Management' },
  { label: 'Orders', icon: <ShoppingCart className="w-5 h-5" />, path: '/orders', shortcut: 'g+o', section: 'Management' },
  { label: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, path: '/analytics', shortcut: 'g+a', section: 'Analytics' },
  { label: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/settings', shortcut: '', section: '' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [helpOpen, setHelpOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const sections = navItems.reduce(
    (acc, item) => {
      if (item.section && !acc.includes(item.section)) acc.push(item.section)
      return acc
    },
    [] as string[],
  )

  const navigateTo = useCallback(
    (path: string) => {
      navigate(path)
      onMobileClose()
    },
    [navigate, onMobileClose],
  )

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setHelpOpen((p) => !p)
      }
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        const onNextKey = (e2: KeyboardEvent) => {
          const map: Record<string, string> = { d: '/', p: '/products', i: '/inventory', o: '/orders', a: '/analytics' }
          if (map[e2.key]) {
            e2.preventDefault()
            navigate(map[e2.key])
          }
          window.removeEventListener('keydown', onNextKey)
        }
        window.addEventListener('keydown', onNextKey)
        setTimeout(() => window.removeEventListener('keydown', onNextKey), 1000)
      }
      if (e.key === 'Escape') {
        setHelpOpen(false)
        setUserDropdownOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  const sidebarContent = (
    <div
      className={`h-full flex flex-col bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-[var(--color-border)] px-4 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-8 h-8 bg-[var(--color-brand)] rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        {!collapsed && <span className="font-semibold text-[var(--color-text)] text-sm whitespace-nowrap">Enterprise</span>}
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-4">
        {sections.map((section) => (
          <div key={section} className="mb-4">
            {!collapsed && (
              <div className="px-4 mb-2">
                <span className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">{section}</span>
              </div>
            )}
            {navItems
              .filter((item) => item.section === section)
              .map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigateTo(item.path)}
                  className={`w-full flex items-center h-10 px-4 mx-2 rounded-md transition-colors ${
                    collapsed ? 'justify-center mx-0 px-0' : 'gap-3'
                  } ${
                    isActive(item.path)
                      ? 'bg-blue-50 dark:bg-blue-950/20 text-[var(--color-brand)] font-medium border-l-[3px] border-[var(--color-brand)] rounded-l-none'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="text-sm truncate">{item.label}</span>}
                </button>
              ))}
          </div>
        ))}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="hidden lg:flex items-center justify-center h-10 mx-2 mb-2 rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* User section */}
      <div className="border-t border-[var(--color-border)] p-3 relative">
        {collapsed ? (
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="w-full flex justify-center"
            title={user?.full_name || 'User'}
          >
            <div className="w-8 h-8 rounded-full bg-[var(--color-brand)] text-white flex items-center justify-center text-xs font-medium">
              {initials}
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-brand)] text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--color-text)] truncate">{user?.full_name || 'User'}</div>
              <div className="text-xs text-[var(--color-text-tertiary)] capitalize">{user?.role || 'viewer'}</div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {userDropdownOpen && collapsed && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
            <div className="absolute left-16 bottom-16 z-50 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg p-3 space-y-2">
              <div className="text-sm font-medium text-[var(--color-text)]">{user?.full_name || 'User'}</div>
              <div className="text-xs text-[var(--color-text-tertiary)] capitalize">{user?.role || 'viewer'}</div>
              <hr className="border-[var(--color-border)]" />
              <button onClick={logout} className="flex items-center gap-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-bg-tertiary)] rounded px-2 py-1 w-full">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </>
        )}
      </div>

      {/* Keyboard help overlay */}
      {helpOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setHelpOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setHelpOpen(false)}>
            <div
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl max-w-sm w-full p-6 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Keyboard shortcuts"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">Keyboard Shortcuts</h2>
                <button onClick={() => setHelpOpen(false)} className="p-1 rounded hover:bg-[var(--color-bg-tertiary)]" aria-label="Close shortcuts">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                {[
                  { keys: 'g then d', desc: 'Go to Dashboard' },
                  { keys: 'g then p', desc: 'Go to Products' },
                  { keys: 'g then i', desc: 'Go to Inventory' },
                  { keys: 'g then o', desc: 'Go to Orders' },
                  { keys: 'g then a', desc: 'Go to Analytics' },
                  { keys: '?', desc: 'Toggle this help' },
                  { keys: 'Ctrl+K', desc: 'Focus search' },
                  { keys: 'Esc', desc: 'Close dialogs / Blur search' },
                ].map(({ keys, desc }) => (
                  <div key={keys} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-[var(--color-bg-tertiary)]">
                    <kbd className="px-1.5 py-0.5 text-xs font-mono bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded text-[var(--color-text-secondary)]">
                      {keys}
                    </kbd>
                    <span className="text-sm text-[var(--color-text-secondary)]">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-full">{sidebarContent}</div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50" onClick={onMobileClose} />
          <div className="fixed left-0 top-0 h-full z-50 shadow-lg">{sidebarContent}</div>
        </div>
      )}
    </>
  )
}

export { Sidebar }
