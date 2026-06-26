import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { api, formatUSD } from "@/lib/api";
import { StatusBadge } from "@/components/ui-bits/status-badge";

export const Route = createFileRoute("/_app/products")({
  head: () => ({ meta: [{ title: "Products — Gateway" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["products"], queryFn: api.products });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Catalog of {data?.length ?? 0} SKUs.
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-3.5 w-3.5" /> Add product
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg border border-border bg-card animate-pulse" />
          ))}
        {(data ?? []).map((p) => (
          <article
            key={p.id}
            className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-foreground/20"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-medium truncate">{p.name}</h3>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{p.sku}</span>
                  <span>·</span>
                  <span>{p.category}</span>
                </div>
              </div>
              <StatusBadge status={p.is_active ? "active" : "inactive"} />
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Price</div>
                <div className="font-mono text-lg font-semibold">{formatUSD(p.unit_price)}</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Reorder</div>
                <div className="font-mono text-sm">{p.reorder_point}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
