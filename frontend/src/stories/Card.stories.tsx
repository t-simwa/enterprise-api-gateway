import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle>Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">$128,430</div>
        <p className="text-xs text-muted-foreground">+12.5% from last month</p>
      </CardContent>
    </Card>
  ),
};
