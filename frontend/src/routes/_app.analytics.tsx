import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip, XAxis, YAxis,
} from "recharts";
import { api, formatUSD } from "@/lib/api";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Gateway" }] }),
  component: AnalyticsPage,
});

const STATUS_COLORS: Record<string, string> = {
  pending: "var(--color-chart-3)",
  processing: "var(--color-chart-1)",
  shipped: "var(--color-chart-5)",
  delivered: "var(--color-chart-2)",
  cancelled: "var(--color-chart-4)",
};

const tooltipContent = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 6,
  fontSize: 13,
};

const tooltipWrapper = {
  maxWidth: "calc(100vw - 2rem)",
  outline: "none",
};

function AnalyticsPage() {
  const { data: kpi } = useQuery({ queryKey: ["dashboard"], queryFn: api.dashboard });
  const { data: series } = useQuery({ queryKey: ["revenue", 30], queryFn: () => api.revenueSeries(30) });
  const [activeBar, setActiveBar] = useState<number | undefined>(undefined);
  const [activePie, setActivePie] = useState<number | undefined>(undefined);

  const pie = Object.entries(kpi?.orders_by_status ?? {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Operational signals across the gateway.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold">Daily revenue</h2>
            <p className="text-xs text-muted-foreground">Trailing 30 days</p>
          </div>
          <div className="h-80 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series ?? []} onMouseLeave={() => setActiveBar(undefined)}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={tooltipContent}
                  wrapperStyle={tooltipWrapper}
                  formatter={(v: number) => [formatUSD(v), "Revenue"]}
                />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-chart-1)"
                  radius={[3, 3, 0, 0]}
                  className="cursor-pointer"
                  activeBar={{
                    fill: "var(--color-chart-1)",
                    stroke: "var(--color-ring)",
                    strokeWidth: 1.5,
                    radius: 3,
                  }}
                  onMouseEnter={(_, index) => setActiveBar(index)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold">Orders by status</h2>
            <p className="text-xs text-muted-foreground">Current pipeline</p>
          </div>
          <div className="h-64 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart onMouseLeave={() => setActivePie(undefined)}>
                <Pie
                  data={pie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={80}
                  stroke="var(--color-background)"
                  strokeWidth={2}
                  className="cursor-pointer"
                  activeIndex={activePie}
                  activeShape={(props: unknown) => {
                    const p = props as Record<string, unknown>;
                    return (
                      <Sector
                        {...p}
                        outerRadius={(p.outerRadius as number) + 10}
                        stroke="var(--color-ring)"
                        strokeWidth={1.5}
                      />
                    );
                  }}
                  onMouseEnter={(_, index) => setActivePie(index)}
                >
                  {pie.map((p) => (
                    <Cell key={p.name} fill={STATUS_COLORS[p.name] ?? "var(--color-chart-1)"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipContent}
                  wrapperStyle={tooltipWrapper}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="border-t border-border px-5 py-3 space-y-1.5 text-sm">
            {pie.map((p) => (
              <li key={p.name} className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 capitalize">
                  <span className="h-2 w-2 rounded-sm" style={{ background: STATUS_COLORS[p.name] }} />
                  {p.name}
                </span>
                <span className="font-mono text-muted-foreground">{p.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
