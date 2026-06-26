import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@/components/ui/badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { children: "active" },
};

export const Pending: Story = {
  args: { variant: "secondary", children: "pending" },
};

export const DestructiveBadge: Story = {
  args: { variant: "destructive", children: "cancelled" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "draft" },
};
