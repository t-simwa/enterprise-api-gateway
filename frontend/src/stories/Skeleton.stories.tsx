import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "UI/Skeleton",
};

export default meta;
type Story = StoryObj;

export const Text: Story = {
  render: () => (
    <div className="space-y-3 w-72">
      <div className="h-4 w-full rounded bg-muted animate-pulse" />
      <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
      <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
    </div>
  ),
};

export const Card: Story = {
  render: () => (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3 w-72">
      <div className="h-4 w-24 rounded bg-muted animate-pulse" />
      <div className="h-8 w-32 rounded bg-muted animate-pulse" />
      <div className="h-3 w-48 rounded bg-muted animate-pulse" />
    </div>
  ),
};

export const TableRow: Story = {
  render: () => (
    <div className="space-y-2 w-full max-w-md">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          <div className="h-4 w-20 rounded bg-muted animate-pulse" />
          <div className="h-4 w-16 rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  ),
};
