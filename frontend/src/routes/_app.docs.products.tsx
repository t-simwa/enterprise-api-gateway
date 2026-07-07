import { createFileRoute } from "@tanstack/react-router";
import { DocPageShell } from "@/components/docs/doc-page-shell";

export const Route = createFileRoute("/_app/docs/products")({
  component: DocsProducts,
});

function DocsProducts() {
  return (
    <DocPageShell
      title="Products"
      description="Manage your product catalog and SKU configurations."
      prev={{ to: "/docs/orders", label: "Orders" }}
      next={{ to: "/docs/inventory", label: "Inventory" }}
    >
      <h2 className="!text-lg !font-semibold tracking-tight">Product catalog</h2>
      <p>
        The Products page displays all SKUs in a responsive card grid. Each card shows the product name,
        SKU, category, price, and reorder point. Use the <em>Add product</em> button to create new entries.
      </p>

      <h2 className="!mt-10 !text-lg !font-semibold tracking-tight">Fields</h2>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2 font-medium">Field</th>
              <th className="px-4 py-2 font-medium">Required</th>
              <th className="px-4 py-2 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr><td className="px-4 py-2 font-mono">SKU</td><td className="px-4 py-2">Yes</td><td className="px-4 py-2">Unique stock-keeping unit identifier</td></tr>
            <tr><td className="px-4 py-2 font-mono">Name</td><td className="px-4 py-2">Yes</td><td className="px-4 py-2">Human-readable product name</td></tr>
            <tr><td className="px-4 py-2 font-mono">Category</td><td className="px-4 py-2">No</td><td className="px-4 py-2">Product group for filtering</td></tr>
            <tr><td className="px-4 py-2 font-mono">Unit price</td><td className="px-4 py-2">Yes</td><td className="px-4 py-2">Price per unit in USD</td></tr>
            <tr><td className="px-4 py-2 font-mono">Reorder point</td><td className="px-4 py-2">No</td><td className="px-4 py-2">Stock level that triggers a low-stock alert</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="!mt-10 !text-lg !font-semibold tracking-tight">Editing products</h2>
      <p>
        Click any product card to open the detail sheet, which shows full product information and current
        warehouse-level inventory. Product editing is available through the detail view.
      </p>

      <h2 className="!mt-10 !text-lg !font-semibold tracking-tight">Active vs inactive</h2>
      <p>
        Products can be marked as inactive to remove them from order creation flows without deleting their
        history. Inactive products display an <em>inactive</em> badge in the catalog.
      </p>
    </DocPageShell>
  );
}
