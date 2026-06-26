import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "UI/Select",
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="w-64">
      <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-1.5 text-sm cursor-pointer">
        <span className="text-muted-foreground">Select product</span>
        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  ),
};

export const WithValue: Story = {
  render: () => (
    <div className="w-64">
      <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-1.5 text-sm cursor-pointer">
        <span>Active</span>
        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  ),
};
