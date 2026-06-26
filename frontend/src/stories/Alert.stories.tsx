import type { Meta, StoryObj } from "@storybook/react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const meta: Meta<typeof Alert> = {
  title: "UI/Alert",
  component: Alert,
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: () => (
    <Alert className="max-w-md">
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>Order #EAG-10240 has been created successfully.</AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" className="max-w-md">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Insufficient stock for product "Carbon Mesh Hoodie". Available: 5.</AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <div className="rounded-md border border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 p-4 max-w-md">
      <div className="text-sm font-medium text-amber-800 dark:text-amber-300">Low stock alert</div>
      <div className="mt-1 text-xs text-amber-700 dark:text-amber-400">3 products are below reorder point. Reorder soon.</div>
    </div>
  ),
};
