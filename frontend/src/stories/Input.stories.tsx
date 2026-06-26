import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof HTMLInputElement> = {
  title: "UI/Input",
  component: () => <input className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />,
};

export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => <input placeholder="Default input" className="flex h-9 w-72 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" /> };

export const WithValue: Story = { render: () => <input defaultValue="Hello world" className="flex h-9 w-72 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" /> };

export const Disabled: Story = { render: () => <input disabled placeholder="Disabled" className="flex h-9 w-72 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" /> };

export const Search: Story = { render: () => (
  <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-sm w-72">
    <svg className="h-3.5 w-3.5 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
    <input placeholder="Search..." className="w-full bg-transparent outline-none placeholder:text-muted-foreground" />
  </div>
) };
