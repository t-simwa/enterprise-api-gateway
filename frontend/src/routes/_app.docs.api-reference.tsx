import { createFileRoute } from "@tanstack/react-router";
import { DocPageShell } from "@/components/docs/doc-page-shell";

export const Route = createFileRoute("/_app/docs/api-reference")({
  component: ApiReference,
});

function ApiReference() {
  return (
    <DocPageShell
      title="API reference"
      description="Complete REST API reference for the Enterprise Gateway."
      prev={{ to: "/docs/inventory", label: "Inventory" }}
    >
      <h2 className="!text-lg !font-semibold tracking-tight">Base URL</h2>
      <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-xs font-mono text-muted-foreground">
        <span className="text-foreground">https://api.example.com</span>/api
      </div>
      <p>
        All requests require a Bearer token in the <code className="font-mono text-xs">Authorization</code> header.
      </p>

      <h2 className="!mt-10 !text-lg !font-semibold tracking-tight">Orders</h2>
      <div className="space-y-4">
        <Endpoint method="GET" path="/orders?size=100" desc="List orders" />
        <Endpoint method="GET" path="/orders/:id" desc="Get order detail with items and timeline" />
        <Endpoint method="POST" path="/orders" desc="Create a new order" />
      </div>

      <h2 className="!mt-8 !text-lg !font-semibold tracking-tight">Products</h2>
      <div className="space-y-4">
        <Endpoint method="GET" path="/products?size=100" desc="List all products" />
        <Endpoint method="POST" path="/products" desc="Create a new product" />
      </div>

      <h2 className="!mt-8 !text-lg !font-semibold tracking-tight">Inventory</h2>
      <div className="space-y-4">
        <Endpoint method="GET" path="/inventory" desc="List inventory across warehouses" />
        <Endpoint method="GET" path="/inventory/low-stock" desc="List items below reorder threshold" />
      </div>

      <h2 className="!mt-8 !text-lg !font-semibold tracking-tight">Analytics</h2>
      <div className="space-y-4">
        <Endpoint method="GET" path="/orders/dashboard" desc="Dashboard KPIs (revenue, order counts, etc.)" />
        <Endpoint method="GET" path="/analytics/revenue?days=30" desc="Revenue time series" />
      </div>

      <h2 className="!mt-8 !text-lg !font-semibold tracking-tight">Auth</h2>
      <div className="space-y-4">
        <Endpoint method="POST" path="/auth/login" desc="Authenticate and receive a Bearer token" />
        <Endpoint method="GET" path="/auth/me" desc="Get current user profile" />
      </div>

      <h2 className="!mt-10 !text-lg !font-semibold tracking-tight">Error codes</h2>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2 font-medium">Code</th>
              <th className="px-4 py-2 font-medium">Meaning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr><td className="px-4 py-2 font-mono">400</td><td className="px-4 py-2">Bad request — invalid payload</td></tr>
            <tr><td className="px-4 py-2 font-mono">401</td><td className="px-4 py-2">Unauthorized — missing or invalid token</td></tr>
            <tr><td className="px-4 py-2 font-mono">404</td><td className="px-4 py-2">Resource not found</td></tr>
            <tr><td className="px-4 py-2 font-mono">409</td><td className="px-4 py-2">Conflict — duplicate SKU or order number</td></tr>
            <tr><td className="px-4 py-2 font-mono">429</td><td className="px-4 py-2">Rate limit exceeded</td></tr>
            <tr><td className="px-4 py-2 font-mono">500</td><td className="px-4 py-2">Internal server error</td></tr>
          </tbody>
        </table>
      </div>
    </DocPageShell>
  );
}

function Endpoint({ method, path, desc }: { method: string; path: string; desc: string }) {
  const bg =
    method === "GET" ? "bg-[var(--color-success)]/10 text-[var(--color-success)]" :
    method === "POST" ? "bg-[var(--color-info)]/10 text-[var(--color-info)]" :
    "bg-muted text-muted-foreground";
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-2.5 text-sm">
      <span className={"shrink-0 rounded px-1.5 py-0.5 text-[11px] font-mono font-semibold " + bg}>{method}</span>
      <code className="font-mono text-xs text-foreground">{path}</code>
      <span className="ml-auto text-xs text-muted-foreground">{desc}</span>
    </div>
  );
}
