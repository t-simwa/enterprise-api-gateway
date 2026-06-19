import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts'
import { Download } from 'lucide-react'
import { ordersApi } from '@/api/orders'
import ErrorBoundary from '@/app/components/common/error-boundary'
import { SkeletonChart } from '@/app/components/common/loading-skeleton'
import EmptyState from '@/app/components/common/empty-state'
import { Button } from '@/app/components/ui/button'

const statusColors: Record<string, string> = {
  pending: '#f59e0b', confirmed: '#3b82f6', processing: '#6366f1',
  shipped: '#8b5cf6', delivered: '#10b981', cancelled: '#ef4444', returned: '#64748b',
}

const quickPresets = ['7D', '30D', '90D', '1Y'] as const

const turnoverData = [
  { category: 'Electronics', turnover: 2.4 },
  { category: 'Clothing', turnover: 3.1 },
  { category: 'Food & Bev.', turnover: 4.2 },
  { category: 'Home & Garden', turnover: 1.8 },
  { category: 'Office Supplies', turnover: 2.0 },
]

const bestSelling = [
  { rank: 1, name: 'Wireless Mouse', sku: 'ELEC-001', qtySold: 342, revenue: 17000 },
  { rank: 2, name: 'Office Chair', sku: 'FURN-003', qtySold: 156, revenue: 46800 },
  { rank: 3, name: 'USB-C Hub', sku: 'ELEC-004', qtySold: 289, revenue: 14450 },
  { rank: 4, name: 'Notebook Set', sku: 'OFFC-002', qtySold: 520, revenue: 5200 },
  { rank: 5, name: 'Desk Lamp', sku: 'HOME-002', qtySold: 198, revenue: 7920 },
]

const slowMoving = [
  { rank: 1, name: 'Winter Jacket', sku: 'CLTH-005', stock: 45, daysSinceSale: 89 },
  { rank: 2, name: 'Printer Paper', sku: 'OFFC-001', stock: 200, daysSinceSale: 67 },
  { rank: 3, name: 'Garden Trowel', sku: 'GARD-001', stock: 78, daysSinceSale: 45 },
  { rank: 4, name: 'Desk Organizer', sku: 'OFFC-003', stock: 34, daysSinceSale: 32 },
  { rank: 5, name: 'Blender', sku: 'HOME-004', stock: 23, daysSinceSale: 28 },
]

const maxRevenue = Math.max(...bestSelling.map((p) => p.revenue))

export default function AnalyticsPage() {
  const [datePreset, setDatePreset] = useState<string>('90D')

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['analytics-dashboard', datePreset],
    queryFn: () => ordersApi.dashboard(),
  })

  const revenueData = useMemo(() => {
    const months = datePreset === '7D' ? 7 : datePreset === '30D' ? 30 : datePreset === '1Y' ? 12 : 90
    const base = dashboard?.total_revenue ?? 50000
    return Array.from({ length: Math.min(months, 12) }, (_, i) => ({
      date: new Date(Date.now() - (months - 1 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.round(base * (0.5 + Math.random() * 0.5) * (1 + i * 0.05)),
    }))
  }, [datePreset, dashboard])

  const pieData = dashboard
    ? Object.entries(dashboard.orders_by_status).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count, status,
      }))
    : []

  return (
    <ErrorBoundary>
      <div className="p-8 max-w-[var(--content-max-width)] mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">Analytics & Reports</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-md border border-[var(--color-border)] overflow-hidden">
              {quickPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setDatePreset(preset)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    datePreset === preset
                      ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                  }`}
                >{preset}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="date" className="h-8 text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2" />
              <span className="text-xs text-[var(--color-text-tertiary)]">to</span>
              <input type="date" className="h-8 text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2" />
              <Button size="sm" className="h-8 text-xs">Apply</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="lg:col-span-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">Revenue ({datePreset})</h2>
              <button className="p-1.5 rounded hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]">
                <Download className="w-4 h-4" />
              </button>
            </div>
            {isLoading ? <SkeletonChart /> : revenueData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} tickFormatter={(v) => `$${Number(v) / 1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }} formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" fill="url(#analyticsGradient)" stroke="none" />
                    <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : <EmptyState icon="default" title="No sales data for this period" />}
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">Orders by Status</h2>
            </div>
            {isLoading ? <SkeletonChart /> : pieData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                      {pieData.map((entry) => (<Cell key={entry.status} fill={statusColors[entry.status] || '#94a3b8'} />))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
                    <Legend verticalAlign="bottom" height={36} formatter={(value: string) => <span style={{ color: 'var(--color-text)', fontSize: 12 }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <EmptyState icon="default" title="No order data" />}
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">Inventory Turnover</h2>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={turnoverData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} domain={[0, 5]} />
                  <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text)', fontSize: 11 }} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }} formatter={(v) => [`${Number(v).toFixed(1)} turns/year`, 'Turnover']} />
                  <Bar dataKey="turnover" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
            <div className="p-4 border-b border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[var(--color-text)]">Best-Selling Products</h2>
                <button className="p-1.5 rounded hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]"><Download className="w-4 h-4" /></button>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-bg-secondary)]">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase w-8">#</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Product</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">SKU</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Sold</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {bestSelling.map((p) => (
                  <tr key={p.rank} className="border-t border-[var(--color-border)] h-10">
                    <td className="px-4 text-[var(--color-text-secondary)]">{p.rank}</td>
                    <td className="px-4 text-[var(--color-text)] font-medium">{p.name}</td>
                    <td className="px-4 font-mono text-xs text-[var(--color-text-secondary)]">{p.sku}</td>
                    <td className="px-4 text-right font-mono tabular-nums">{p.qtySold}</td>
                    <td className="px-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="w-16 h-2 rounded-full bg-emerald-100 dark:bg-emerald-950/30 overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500/60" style={{ width: `${(p.revenue / maxRevenue) * 100}%` }} />
                        </div>
                        <span className="font-mono tabular-nums text-xs">${p.revenue.toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
            <div className="p-4 border-b border-[var(--color-border)]">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">Slow-Moving Products</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-bg-secondary)]">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase w-8">#</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Product</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">SKU</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Stock</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Days</th>
                </tr>
              </thead>
              <tbody>
                {slowMoving.map((p) => (
                  <tr key={p.rank} className={`border-t border-[var(--color-border)] h-10 ${p.daysSinceSale < 30 ? 'bg-red-50/50 dark:bg-red-950/10' : ''}`}>
                    <td className="px-4 text-[var(--color-text-secondary)]">{p.rank}</td>
                    <td className="px-4 text-[var(--color-text)] font-medium">{p.name}</td>
                    <td className="px-4 font-mono text-xs text-[var(--color-text-secondary)]">{p.sku}</td>
                    <td className="px-4 text-right font-mono tabular-nums">{p.stock}</td>
                    <td className={`px-4 text-right font-mono tabular-nums ${p.daysSinceSale < 30 ? 'text-red-600 font-semibold' : ''}`}>{p.daysSinceSale}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
