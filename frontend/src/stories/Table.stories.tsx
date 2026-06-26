import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "UI/Table",
};

export default meta;
type Story = StoryObj;

const sampleData = [
  { order: "EAG-10240", customer: "Acme Inc.", status: "pending", total: "$1,234" },
  { order: "EAG-10241", customer: "Globex", status: "shipped", total: "$2,456" },
  { order: "EAG-10242", customer: "Initech", status: "delivered", total: "$3,789" },
  { order: "EAG-10243", customer: "Umbrella Co.", status: "processing", total: "$512" },
  { order: "EAG-10244", customer: "Wayne Enterprises", status: "cancelled", total: "$8,901" },
];

export const Default: Story = {
  render: () => (
    <div className="rounded-lg border border-border bg-card overflow-hidden max-w-2xl">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
            <th className="px-5 py-2.5 font-medium">Order</th>
            <th className="px-5 py-2.5 font-medium">Customer</th>
            <th className="px-5 py-2.5 font-medium">Status</th>
            <th className="px-5 py-2.5 font-medium text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sampleData.map((row, i) => (
            <tr key={i} className="hover:bg-muted/30">
              <td className="px-5 py-3 font-mono text-xs">{row.order}</td>
              <td className="px-5 py-3">{row.customer}</td>
              <td className="px-5 py-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  <span className="font-medium capitalize">{row.status}</span>
                </span>
              </td>
              <td className="px-5 py-3 text-right font-mono">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="rounded-lg border border-border bg-card overflow-hidden max-w-2xl">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
            <th className="px-5 py-2.5 font-medium">Order</th>
            <th className="px-5 py-2.5 font-medium">Customer</th>
            <th className="px-5 py-2.5 font-medium">Status</th>
            <th className="px-5 py-2.5 font-medium text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={4} className="px-5 py-12 text-center text-sm text-muted-foreground">
              No orders match your filters.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
};
