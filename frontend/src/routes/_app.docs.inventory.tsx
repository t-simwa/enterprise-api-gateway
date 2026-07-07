import { createFileRoute } from "@tanstack/react-router";
import { DocPageShell } from "@/components/docs/doc-page-shell";

export const Route = createFileRoute("/_app/docs/inventory")({
  component: DocsInventory,
});

function DocsInventory() {
  return (
    <DocPageShell
      title="Inventory"
      description="Track stock levels, reservations, and availability across warehouses."
      prev={{ to: "/docs/products", label: "Products" }}
      next={{ to: "/docs/api-reference", label: "API reference" }}
    >
      <h2 className="!text-lg !font-semibold tracking-tight">Warehouse view</h2>
      <p>
        The Inventory page shows stock data aggregated by warehouse. Use the warehouse filter to focus on a
        specific location. Each row displays the SKU, product name, quantity on hand, reserved units, and
        available units.
      </p>

      <h2 className="!mt-10 !text-lg !font-semibold tracking-tight">Quantity columns</h2>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2 font-medium">Column</th>
              <th className="px-4 py-2 font-medium">Definition</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr><td className="px-4 py-2 font-mono">On hand</td><td className="px-4 py-2">Total physical stock in the warehouse</td></tr>
            <tr><td className="px-4 py-2 font-mono">Reserved</td><td className="px-4 py-2">Units allocated to open orders</td></tr>
            <tr><td className="px-4 py-2 font-mono">Available</td><td className="px-4 py-2">On hand minus reserved (sellable stock)</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="!mt-10 !text-lg !font-semibold tracking-tight">Low-stock alerts</h2>
      <p>
        When available stock falls below a product's reorder point, the item appears in the low-stock panel
        on the dashboard and the notification bell shows a warning badge. Warehouse managers receive
        real-time alerts via WebSocket when stock crosses the threshold.
      </p>

      <h2 className="!mt-10 !text-lg !font-semibold tracking-tight">Detail view</h2>
      <p>
        Click any inventory row to open the product detail sheet, which shows warehouse-level breakdowns and
        product metadata.
      </p>
    </DocPageShell>
  );
}
