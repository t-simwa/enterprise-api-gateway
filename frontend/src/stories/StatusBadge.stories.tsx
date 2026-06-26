import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "@/components/ui-bits/status-badge";

const meta: Meta<typeof StatusBadge> = {
  title: "UI/StatusBadge",
  component: StatusBadge,
  argTypes: {
    status: {
      control: "select",
      options: ["pending", "processing", "shipped", "delivered", "cancelled", "active", "inactive"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Pending: Story = { args: { status: "pending" } };
export const Processing: Story = { args: { status: "processing" } };
export const Shipped: Story = { args: { status: "shipped" } };
export const Delivered: Story = { args: { status: "delivered" } };
export const Cancelled: Story = { args: { status: "cancelled" } };
export const Active: Story = { args: { status: "active" } };
export const Inactive: Story = { args: { status: "inactive" } };
export const Unknown: Story = { args: { status: "unknown" } };
