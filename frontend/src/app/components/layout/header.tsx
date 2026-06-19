import { useState } from 'react'
import { useAuthStore } from '@/hooks/use-auth'
import { SearchInput } from '@/app/components/common/search-input'
import Breadcrumbs from './breadcrumbs'

interface HeaderProps {
  onMenuToggle: () => void
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark')
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  return (
    <header className="h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-4 lg:px-6 z-30">
      {/* Left: Hamburger + Breadcrumbs */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-md hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right: Search, Theme, User */}
      <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
        <SearchInput placeholder="Search..." className="hidden lg:inline-flex" />

        {/* Theme toggle */}
        <button
          onClick={toggleDark}
          className="p-2 rounded-md hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] transition-colors"
          aria-label="Toggle dark mode"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-md hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] transition-colors"
          aria-label="Notifications"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        {/* User avatar */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-8 h-8 rounded-full bg-[var(--color-brand)] text-white flex items-center justify-center text-xs font-medium hover:opacity-90 transition-opacity"
            aria-label="User menu"
          >
            {initials}
          </button>
          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-10 z-50 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg p-2 space-y-1 animate-fade-in">
                <div className="px-3 py-2">
                  <div className="text-sm font-medium text-[var(--color-text)]">{user?.full_name || 'User'}</div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">{user?.email || ''}</div>
                  <div className="text-xs text-[var(--color-text-tertiary)] capitalize mt-0.5">{user?.role || 'viewer'}</div>
                </div>
                <hr className="border-[var(--color-border)]" />
                <button className="w-full text-left px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] rounded transition-colors">Settings</button>
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-sm text-[var(--color-danger)] hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
