import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Gateway" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const { data, isLoading } = useQuery({ queryKey: ["inventory"], queryFn: api.inventory });
  const [wh, setWh] = useState<string>("all");

  const warehouses = useMemo(
    () => Array.from(new Set((data ?? []).map((r) => r.warehouse))),
    [data],
  );
  const rows = useMemo(
    () => (data ?? []).filter((r) => wh === "all" || r.warehouse === wh),
    [data, wh],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">Live stock across warehouses.</p>
        </div>
        <div className="hidden md:flex items-center gap-1 rounded-md border border-border p-0.5 text-xs">
          <button
            onClick={() => setWh("all")}
            className={
              "rounded px-2 py-1 " +
              (wh === "all" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")
            }
          >
            All
          </button>
          {warehouses.map((w) => (
            <button
              key={w}
              onClick={() => setWh(w)}
              className={
                "rounded px-2 py-1 " +
                (wh === w ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")
              }
            >
              {w}
            </button>
          ))}
        </div>
        <div className="md:hidden w-full sm:w-auto">
          <Select value={wh} onValueChange={setWh}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All</SelectItem>
              {warehouses.map((w) => (
                <SelectItem key={w} value={w} className="text-xs">{w}</SelectItem>
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
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">SKU</th>
                <th className="px-5 py-2.5 font-medium">Product</th>
                <th className="px-5 py-2.5 font-medium hidden lg:table-cell">Warehouse</th>
                <th className="px-5 py-2.5 font-medium text-right">On hand</th>
                <th className="px-5 py-2.5 font-medium text-right hidden sm:table-cell">Reserved</th>
                <th className="px-5 py-2.5 font-medium text-right hidden sm:table-cell">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading &&
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </td>
                  </tr>
                ))}
              {rows.map((r, i) => {
                const critical = r.quantity < 10;
                return (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-mono text-xs">{r.sku}</td>
                    <td className="px-5 py-3 truncate max-w-[160px]">{r.name}</td>
                    <td className="px-5 py-3 text-muted-foreground hidden lg:table-cell">{r.warehouse}</td>
                    <td className={"px-5 py-3 text-right font-mono " + (critical ? "text-[var(--color-destructive)]" : "")}>
                      {r.quantity}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-muted-foreground hidden sm:table-cell">{r.reserved}</td>
                    <td className="px-5 py-3 text-right font-mono hidden sm:table-cell">{r.available}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile cards ── */}
      <div className="md:hidden space-y-2">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-2">
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              <div className="h-3 w-36 rounded bg-muted animate-pulse" />
            </div>
          ))}
        {rows.map((r, i) => {
          const critical = r.quantity < 10;
          return (
            <div key={i} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-mono text-xs text-muted-foreground">{r.sku}</div>
                  <div className="text-sm font-medium truncate">{r.name}</div>
                </div>
                <span className={"shrink-0 font-mono text-sm " + (critical ? "text-[var(--color-destructive)]" : "")}>
                  {r.quantity}
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {r.warehouse}
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span>Reserved: <span className="font-mono">{r.reserved}</span></span>
                <span className="text-muted-foreground/50">·</span>
                <span>Available: <span className="font-mono">{r.available}</span></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
