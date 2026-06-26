import type { Meta, StoryObj } from "@storybook/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const meta: Meta<typeof Dialog> = {
  title: "UI/Dialog",
  component: Dialog,
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: "2rem" }}>
      <div className="rounded-lg border border-border bg-card p-6 max-w-lg mx-auto">
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New order</DialogTitle>
              <DialogDescription>Create a new order with line items.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Customer name *</label>
                <input placeholder="e.g. Acme Inc." className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground">Cancel</button>
                <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">Create order</button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  ),
};
