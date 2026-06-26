import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Dashboard/KPI Cards",
};

export default meta;
type Story = StoryObj;

export const RevenueKpi: Story = {
  render: () => (
    <div className="rounded-lg border border-border bg-card p-5 w-64">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Revenue</div>
      <div className="mt-2 text-2xl font-bold">$128,430</div>
      <div className="mt-1 flex items-center gap-1 text-xs text-[var(--color-success)]">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
        <span>+12.5% from last month</span>
      </div>
    </div>
  ),
};

export const OrdersKpi: Story = {
  render: () => (
    <div className="rounded-lg border border-border bg-card p-5 w-64">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Orders</div>
      <div className="mt-2 text-2xl font-bold">1,432</div>
      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <span>12 pending</span>
      </div>
    </div>
  ),
};

export const LowStockKpi: Story = {
  render: () => (
    <div className="rounded-lg border border-border bg-card p-5 w-64">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Low Stock Items</div>
      <div className="mt-2 text-2xl font-bold text-[var(--color-destructive)]">3</div>
      <div className="mt-1 flex items-center gap-1 text-xs text-[var(--color-destructive)]">
        <span>Needs immediate attention</span>
      </div>
    </div>
  ),
};

export const ProcessingKpi: Story = {
  render: () => (
    <div className="rounded-lg border border-border bg-card p-5 w-64">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Processing</div>
      <div className="mt-2 text-2xl font-bold">6.4h</div>
      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <span>Across all orders</span>
      </div>
    </div>
  ),
};
