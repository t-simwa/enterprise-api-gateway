import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Dashboard/Mobile Card",
};

export default meta;
type Story = StoryObj;

const sample = [
  { order: "EAG-10240", customer: "Acme Inc.", status: "pending", amount: "$1,234", items: 3 },
  { order: "EAG-10241", customer: "Globex", status: "shipped", amount: "$2,456", items: 1 },
  { order: "EAG-10242", customer: "Initech", status: "delivered", amount: "$3,789", items: 5 },
];

export const OrderCard: Story = {
  render: () => (
    <div className="space-y-2 max-w-sm">
      {sample.map((o, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-mono text-xs text-muted-foreground">{o.order}</div>
              <div className="text-sm font-medium truncate">{o.customer}</div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              <span className="font-medium capitalize">{o.status}</span>
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-mono">{o.amount}</span>
            <span className="text-muted-foreground/50">·</span>
            <span>{o.items} items</span>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const LowStockCard: Story = {
  render: () => (
    <div className="space-y-2 max-w-sm">
      {[
        { name: "Carbon Mesh Hoodie", sku: "SKU-1000", qty: 3, reorder: 30 },
        { name: "Tungsten Bolt M6", sku: "SKU-1001", qty: 5, reorder: 25 },
      ].map((item, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{item.name}</div>
            <div className="text-xs text-muted-foreground font-mono">{item.sku}</div>
          </div>
          <div className="text-right shrink-0 ml-3">
            <div className="text-sm font-mono text-[var(--color-destructive)]">{item.qty}</div>
            <div className="text-xs text-muted-foreground">reorder at {item.reorder}</div>
          </div>
        </div>
      ))}
    </div>
  ),
};
