import { createFileRoute } from "@tanstack/react-router";
import { DocPageShell } from "@/components/docs/doc-page-shell";

export const Route = createFileRoute("/_app/docs/")({
  component: DocsOverview,
});

function DocsOverview() {
  return (
    <DocPageShell
      title="Enterprise API Gateway"
      description="Real-time inventory, order processing, and warehouse management for operations teams."
      next={{ to: "/docs/getting-started", label: "Quick start" }}
    >
      <p>
        The Enterprise API Gateway provides a unified interface for managing orders, products, and inventory
        across warehouses and regions. This documentation covers setup, everyday operations, and API reference.
      </p>

      <h2 className="!mt-10 !text-lg !font-semibold tracking-tight">What you can do</h2>

      <ul className="list-disc pl-5 space-y-2 text-sm">
        <li><strong>Orders</strong> — Create, track, and manage orders with line-item support and status transitions.</li>
        <li><strong>Products</strong> — Maintain a catalog of SKUs with pricing, categories, and reorder thresholds.</li>
        <li><strong>Inventory</strong> — Monitor stock levels across warehouses with reserved and available quantities.</li>
        <li><strong>Analytics</strong> — View revenue trends, order volume breakdowns, and low-stock alerts.</li>
      </ul>

      <h2 className="!mt-10 !text-lg !font-semibold tracking-tight">Architecture</h2>

      <p>
        The platform uses a reactive dashboard backed by a RESTful API. All data is available in real-time
        through the web interface, with WebSocket push for critical events like low-stock alerts.
      </p>

      <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-xs font-mono text-muted-foreground">
        <div>Frontend &nbsp;&nbsp;→&nbsp;&nbsp; React + Tailwind + TanStack Router</div>
        <div>API Layer &nbsp;&nbsp;→&nbsp;&nbsp; FastAPI (Python 3.12)</div>
        <div>Auth &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→&nbsp;&nbsp; Bearer token / demo mode</div>
        <div>Realtime &nbsp;&nbsp;&nbsp;&nbsp;→&nbsp;&nbsp; WebSocket push</div>
      </div>

      <h2 className="!mt-10 !text-lg !font-semibold tracking-tight">Mock vs live mode</h2>

      <p>
        By default the app runs in <strong>mock mode</strong> with simulated data — no backend required.
        Set <code className="font-mono text-xs">VITE_API_BASE_URL</code> to a FastAPI instance to use live data.
      </p>
    </DocPageShell>
  );
}
