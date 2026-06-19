export default function Dashboard() {
  return (
    <div className="p-8 max-w-[var(--content-max-width)] mx-auto">
      {/* Page header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">Dashboard</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPI cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
        {[
          { label: 'Total Products', value: '—', color: 'brand' },
          { label: 'Low Stock Items', value: '—', color: 'danger' },
          { label: 'Pending Orders', value: '—', color: 'warning' },
          { label: 'Total Revenue', value: '—', color: 'success' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-[var(--color-brand)] opacity-20" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[var(--color-text)] font-mono tabular-nums">
              {kpi.value}
            </div>
            <div className="text-sm text-[var(--color-text-secondary)] mt-1">
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Revenue Overview</h2>
          <div className="h-[300px] rounded-md bg-[var(--color-bg-secondary)] flex items-center justify-center text-sm text-[var(--color-text-tertiary)]">
            Chart placeholder
          </div>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Orders by Status</h2>
          <div className="h-[300px] rounded-md bg-[var(--color-bg-secondary)] flex items-center justify-center text-sm text-[var(--color-text-tertiary)]">
            Chart placeholder
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="p-6 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Recent Orders</h2>
        </div>
        <div className="p-6 text-sm text-[var(--color-text-tertiary)] text-center">
          No orders yet
        </div>
      </div>
    </div>
  )
}
