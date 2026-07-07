import { createFileRoute } from "@tanstack/react-router";
import { DocPageShell } from "@/components/docs/doc-page-shell";

export const Route = createFileRoute("/_app/docs/orders")({
  component: DocsOrders,
});

function DocsOrders() {
  return (
    <DocPageShell
      title="Orders"
      description="Create, track, and manage customer orders."
      prev={{ to: "/docs/getting-started", label: "Quick start" }}
      next={{ to: "/docs/products", label: "Products" }}
    >
      <h2 className="!text-lg !font-semibold tracking-tight">Order lifecycle</h2>
      <p>
        Orders progress through five states: <strong>pending</strong> → <strong>processing</strong> →
        <strong>shipped</strong> → <strong>delivered</strong>. Orders can be <strong>cancelled</strong> at
        any point before delivery.
      </p>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Meaning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr><td className="px-4 py-2 font-mono">Pending</td><td className="px-4 py-2">Order created, awaiting processing</td></tr>
            <tr><td className="px-4 py-2 font-mono">Processing</td><td className="px-4 py-2">Items being picked and packed</td></tr>
            <tr><td className="px-4 py-2 font-mono">Shipped</td><td className="px-4 py-2">Order dispatched to carrier</td></tr>
            <tr><td className="px-4 py-2 font-mono">Delivered</td><td className="px-4 py-2">Confirmed delivered by carrier</td></tr>
            <tr><td className="px-4 py-2 font-mono">Cancelled</td><td className="px-4 py-2">Order voided before fulfillment</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="!mt-10 !text-lg !font-semibold tracking-tight">Creating an order</h2>
      <p>
        Click <em>Create order</em> on the Orders page. Specify the customer name and email, then add one
        or more line items by selecting a product and entering a quantity. The total is calculated automatically.
      </p>

      <h2 className="!mt-10 !text-lg !font-semibold tracking-tight">Viewing order details</h2>
      <p>
        Click any order row to open the detail sheet. It shows the full list of items, customer contact
        information, and a timeline of status changes.
      </p>

      <h2 className="!mt-10 !text-lg !font-semibold tracking-tight">Search and filter</h2>
      <p>
        Use the search bar to find orders by number or customer name. The status filter lets you narrow
        results to a single fulfillment stage.
      </p>
    </DocPageShell>
  );
}
