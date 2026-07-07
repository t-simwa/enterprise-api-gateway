import { createFileRoute } from "@tanstack/react-router";
import { DocPageShell } from "@/components/docs/doc-page-shell";

export const Route = createFileRoute("/_app/docs/getting-started")({
  component: GettingStarted,
});

function GettingStarted() {
  return (
    <DocPageShell
      title="Quick start"
      description="Get up and running with the Enterprise API Gateway in minutes."
      prev={{ to: "/docs", label: "Overview" }}
      next={{ to: "/docs/orders", label: "Orders" }}
    >
      <h2 className="!text-lg !font-semibold tracking-tight">1. Explore the dashboard</h2>
      <p>
        When you open the app you will see the Operations overview — four KPI cards, a revenue chart, a
        low-stock panel, and a recent-orders table. All data is pre-loaded in mock mode so you can start
        exploring immediately.
      </p>

      <h2 className="!mt-10 !text-lg !font-semibold tracking-tight">2. Create your first order</h2>
      <p>
        Navigate to the <strong>Orders</strong> page and click the <em>Create order</em> button. Fill in the
        customer name, email, and one or more line items. The order will be saved in your browser (mock mode)
        or sent to the backend (live mode).
      </p>
      <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-xs font-mono text-muted-foreground">
        Orders persist across page reloads via localStorage when running in mock mode.
      </div>

      <h2 className="!mt-10 !text-lg !font-semibold tracking-tight">3. Add a product</h2>
      <p>
        On the <strong>Products</strong> page, click <em>Add product</em>. Enter a unique SKU, product name,
        unit price, and an optional category and reorder point. The new SKU will appear immediately in the
        product grid and will be available when creating orders.
      </p>

      <h2 className="!mt-10 !text-lg !font-semibold tracking-tight">4. Monitor inventory</h2>
      <p>
        The <strong>Inventory</strong> page shows stock levels across warehouses. Use the warehouse filter to
        narrow down to a specific location. Rows with critically low stock are highlighted in red.
      </p>

      <h2 className="!mt-10 !text-lg !font-semibold tracking-tight">5. Keyboard shortcuts</h2>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2 font-medium">Shortcut</th>
              <th className="px-4 py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr><td className="px-4 py-2 font-mono text-xs">⌘K</td><td className="px-4 py-2">Open command palette</td></tr>
            <tr><td className="px-4 py-2 font-mono text-xs">⌘B</td><td className="px-4 py-2">Toggle sidebar</td></tr>
            <tr><td className="px-4 py-2 font-mono text-xs">G then O</td><td className="px-4 py-2">Go to Overview</td></tr>
            <tr><td className="px-4 py-2 font-mono text-xs">G then R</td><td className="px-4 py-2">Go to Orders</td></tr>
            <tr><td className="px-4 py-2 font-mono text-xs">G then P</td><td className="px-4 py-2">Go to Products</td></tr>
            <tr><td className="px-4 py-2 font-mono text-xs">G then I</td><td className="px-4 py-2">Go to Inventory</td></tr>
            <tr><td className="px-4 py-2 font-mono text-xs">G then A</td><td className="px-4 py-2">Go to Analytics</td></tr>
            <tr><td className="px-4 py-2 font-mono text-xs">G then S</td><td className="px-4 py-2">Go to Settings</td></tr>
          </tbody>
        </table>
      </div>
    </DocPageShell>
  );
}
