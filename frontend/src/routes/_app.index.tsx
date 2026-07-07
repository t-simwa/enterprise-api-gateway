import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Activity, AlertTriangle } from "lucide-react";
import { api, formatNum, formatUSD, isMock, sparkSeries } from "@/lib/api";
import { KpiCard } from "@/components/ui-bits/kpi-card";
import { StatusBadge } from "@/components/ui-bits/status-badge";
import { OrderDetailSheet } from "@/components/ui-bits/order-detail-sheet";
import { ProductDetailSheet } from "@/components/ui-bits/product-detail-sheet";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Overview — Enterprise API Gateway" },
      { name: "description", content: "Real-time inventory and order operations." },
    ],
  }),
  component: Dashboard,
});

const RANGES = [1, 7, 30, 90] as const;

function Dashboard() {
  const { data: kpi, isLoading: kpiLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: api.dashboard,
  });
  const [range, setRange] = useState(30);
  const { data: series } = useQuery({
    queryKey: ["revenue", range],
    queryFn: () => api.revenueSeries(range),
  });
  const { data: orders } = useQuery({ queryKey: ["recent-orders"], queryFn: () => api.recentOrders(8) });
  const { data: lowStock } = useQuery({ queryKey: ["low-stock"], queryFn: api.lowStock });

  const [detailId, setDetailId] = useState<string | null>(null);
  const [productDetailId, setProductDetailId] = useState<string | null>(null);
  const routerState = useRouterState({ select: (s) => s.location.state as { detailId?: string } | null });

  useEffect(() => {
    if (routerState?.detailId) setDetailId(routerState.detailId);
  }, [routerState?.detailId]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-10">
      {/* Header band — flat, enterprise */}
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            <Activity className="h-3 w-3" />
            <span>{isMock ? "Sandbox environment" : "Production"}</span>
            <span className="text-muted-foreground/50">·</span>
            <span className="font-mono">{new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" })}</span>
          </div>
          <h1 className="mt-2 text-[26px] sm:text-[32px] font-semibold tracking-[-0.02em] leading-tight">
            Operations overview
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">
            Inventory, orders, and fulfillment across every warehouse and region.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">{range}D view</span>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 h-8 text-[13px] font-medium hover:opacity-90"
          >
            View orders <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>


      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total revenue"
          value={kpi ? formatUSD(kpi.total_revenue) : ""}
          delta={12.4}
          hint="Last 30 days"
          loading={kpiLoading}
          spark={sparkSeries(3)}
        />
        <KpiCard
          label="Orders"
          value={kpi ? formatNum(kpi.total_orders) : ""}
          delta={4.1}
          hint={`${kpi?.orders_today ?? 0} today`}
          loading={kpiLoading}
          spark={sparkSeries(7)}
        />
        <KpiCard
          label="Avg. processing"
          value={kpi ? `${kpi.avg_processing_hours.toFixed(1)}h` : ""}
          delta={-8.6}
          hint="Goal under 8h"
          loading={kpiLoading}
          spark={sparkSeries(11)}
        />
        <KpiCard
          label="Low stock SKUs"
          value={kpi ? formatNum(kpi.low_stock_count) : ""}
          delta={2.3}
          hint="Across all warehouses"
          loading={kpiLoading}
          spark={sparkSeries(17)}
        />
      </section>

      {/* Chart + low stock */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div>
              <h2 className="text-sm font-semibold">Revenue</h2>
              <p className="text-xs text-muted-foreground">Trailing {range} days</p>
            </div>
            <div className="flex items-center gap-1 text-xs">
              {RANGES.map((d) => (
                <button
                  key={d}
                  onClick={() => setRange(d)}
                  className={
                    "rounded px-2 py-1 cursor-pointer " +
                    (d === range
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>
          <div className="h-72 p-3 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series ?? []}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [formatUSD(v), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[var(--color-warning)]" />
              <h2 className="text-sm font-semibold">Low stock</h2>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {lowStock?.length ?? 0} items
            </span>
          </div>
          <ul className="divide-y divide-border">
            {(lowStock ?? []).slice(0, 6).map((item) => (
              <li key={item.product_id + item.sku} className="flex items-center justify-between px-5 py-3 text-sm cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setProductDetailId(item.product_id)}>
                <div className="min-w-0">
                  <div className="truncate font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{item.sku}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">{item.total_qty}</div>
                  <div className="text-[11px] text-muted-foreground">reorder ≥ {item.reorder_point}</div>
                </div>
              </li>
            ))}
            {lowStock && lowStock.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">All stocked.</li>
            )}
          </ul>
        </div>
      </section>

      {/* Recent orders */}
      <section className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold">Recent orders</h2>
          <Link to="/orders" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* ── Desktop table ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Order</th>
                <th className="px-5 py-2.5 font-medium">Customer</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium text-right hidden sm:table-cell">Items</th>
                <th className="px-5 py-2.5 font-medium text-right">Total</th>
                <th className="px-5 py-2.5 font-medium text-right hidden lg:table-cell">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(orders ?? []).map((o) => (
                <tr key={o.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setDetailId(o.id)}>
                  <td className="px-5 py-3 font-mono text-xs">{o.order_number}</td>
                  <td className="px-5 py-3 truncate max-w-[140px] lg:max-w-none">{o.customer_name}</td>
                  <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-5 py-3 text-right font-mono hidden sm:table-cell">{o.items_count}</td>
                  <td className="px-5 py-3 text-right font-mono">{formatUSD(o.total_amount)}</td>
                  <td className="px-5 py-3 text-right text-xs text-muted-foreground hidden lg:table-cell">
                    {new Date(o.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Mobile cards ── */}
        <div className="md:hidden divide-y divide-border">
          {(orders ?? []).map((o) => (
            <div key={o.id} className="px-5 py-3 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setDetailId(o.id)}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-mono text-xs text-muted-foreground">{o.order_number}</div>
                  <div className="text-sm font-medium truncate">{o.customer_name}</div>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{formatUSD(o.total_amount)}</span>
                <span className="text-muted-foreground/50">·</span>
                <span>{o.items_count} item{o.items_count !== 1 ? "s" : ""}</span>
                <span className="text-muted-foreground/50">·</span>
                <span>
                  {new Date(o.created_at).toLocaleString(undefined, {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <OrderDetailSheet orderId={detailId} open={!!detailId} onOpenChange={(o) => { if (!o) setDetailId(null); }} />
      <ProductDetailSheet productId={productDetailId} open={!!productDetailId} onOpenChange={(o) => { if (!o) setProductDetailId(null); }} />
    </div>
  );
}
