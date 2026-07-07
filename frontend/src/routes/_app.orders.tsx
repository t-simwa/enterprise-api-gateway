import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Search, Plus, ExternalLink } from "lucide-react";
import { api, formatUSD } from "@/lib/api";
import { StatusBadge } from "@/components/ui-bits/status-badge";
import { OrderDetailSheet } from "@/components/ui-bits/order-detail-sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderFormDialog } from "@/components/forms/order-form";

export const Route = createFileRoute("/_app/orders")({
  head: () => ({ meta: [{ title: "Orders — Gateway" }] }),
  component: OrdersPage,
});

const STATUS_FILTERS = ["all", "pending", "processing", "shipped", "delivered", "cancelled"] as const;

function OrdersPage() {
  const { data, isLoading } = useQuery({ queryKey: ["orders"], queryFn: api.allOrders });
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [q, setQ] = useState("");
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const routerState = useRouterState({ select: (s) => s.location.state as { detailId?: string } | null });
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    if (routerState?.detailId) setDetailId(routerState.detailId);
  }, [routerState?.detailId]);

  const filtered = useMemo(() => {
    let rows = data ?? [];
    if (filter !== "all") rows = rows.filter((r) => r.status === filter);
    if (q.trim()) {
      const s = q.toLowerCase();
      rows = rows.filter(
        (r) => r.order_number.toLowerCase().includes(s) || r.customer_name.toLowerCase().includes(s),
      );
    }
    return rows;
  }, [data, filter, q]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} of {data?.length ?? 0} orders
          </p>
        </div>
        <button
          onClick={() => setOrderFormOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> New order
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-sm">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search order # or customer"
            className="w-full sm:w-64 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="hidden md:flex items-center gap-1 rounded-md border border-border p-0.5 text-xs">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={
                "rounded px-2 py-1 capitalize " +
                (filter === s ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")
              }
            >
              {s}
            </button>
          ))}
        </div>
        <div className="md:hidden w-full sm:w-auto">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="h-8 text-xs capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s} value={s} className="capitalize text-xs">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                <th className="px-5 py-2.5 font-medium">Order</th>
                <th className="px-5 py-2.5 font-medium">Customer</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium text-right hidden sm:table-cell">Items</th>
                <th className="px-5 py-2.5 font-medium text-right">Total</th>
                <th className="px-5 py-2.5 font-medium text-right hidden lg:table-cell">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5 py-3">
                      <div className="h-4 w-full rounded bg-muted animate-pulse" />
                    </td>
                  </tr>
                ))}
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => setDetailId(o.id)}
                >
                  <td className="px-5 py-3 font-mono text-xs">{o.order_number}</td>
                  <td className="px-5 py-3 truncate max-w-[140px] lg:max-w-none">{o.customer_name}</td>
                  <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-5 py-3 text-right font-mono hidden sm:table-cell">{o.items_count}</td>
                  <td className="px-5 py-3 text-right font-mono">{formatUSD(o.total_amount)}</td>
                  <td className="px-5 py-3 text-right text-xs text-muted-foreground hidden lg:table-cell">
                    <span className="inline-flex items-center gap-1">
                      {new Date(o.created_at).toLocaleString(undefined, {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                      <ExternalLink className="size-3 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No orders match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile cards ── */}
      <div className="md:hidden space-y-2">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-2">
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              <div className="h-3 w-32 rounded bg-muted animate-pulse" />
            </div>
          ))}
        {filtered.map((o) => (
          <div
            key={o.id}
            className="rounded-lg border border-border bg-card p-4 cursor-pointer hover:border-foreground/20 transition-colors"
            onClick={() => setDetailId(o.id)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono text-xs text-muted-foreground">{o.order_number}</div>
                <div className="text-sm font-medium truncate">{o.customer_name}</div>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
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
        {!isLoading && filtered.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No orders match your filters.
          </div>
        )}
      </div>

      <OrderFormDialog open={orderFormOpen} onOpenChange={setOrderFormOpen} />
      <OrderDetailSheet orderId={detailId} open={!!detailId} onOpenChange={(o) => { if (!o) setDetailId(null); }} />
    </div>
  );
}
