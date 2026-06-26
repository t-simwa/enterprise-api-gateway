import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Dashboard/Notifications",
};

export default meta;
type Story = StoryObj;

export const NotificationList: Story = {
  render: () => (
    <div className="w-80 rounded-lg border border-border bg-card shadow-lg">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-sm font-medium">Notifications</span>
        <button className="text-xs text-muted-foreground hover:text-foreground">Clear all</button>
      </div>
      <div className="divide-y divide-border max-h-72 overflow-y-auto">
        {[
          { title: "Low stock: Carbon Mesh Hoodie", desc: "Only 3 units remaining in US-East", time: "2m ago", type: "warning" },
          { title: "Low stock: Tungsten Bolt M6", desc: "Only 5 units remaining in US-West", time: "5m ago", type: "warning" },
          { title: "Order EAG-10245 shipped", desc: "Shipped to Acme Inc.", time: "1h ago", type: "info" },
        ].map((n, i) => (
          <div key={i} className="px-4 py-3 hover:bg-muted/30 cursor-pointer">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${n.type === "warning" ? "bg-amber-500" : "bg-blue-500"}`} />
              <div className="min-w-0">
                <div className="text-sm font-medium">{n.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{n.desc}</div>
                <div className="text-xs text-muted-foreground/60 mt-0.5">{n.time}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <div className="w-80 rounded-lg border border-border bg-card shadow-lg">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-sm font-medium">Notifications</span>
      </div>
      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
        No new notifications
      </div>
    </div>
  ),
};
