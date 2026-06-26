import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X, Search } from "lucide-react";
import { api, type OrderCreateInput } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderFormDialog({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: api.products });

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [items, setItems] = useState<{ product_id: string; quantity: number }[]>([
    { product_id: "", quantity: 1 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setCustomerName("");
    setCustomerEmail("");
    setItems([{ product_id: "", quantity: 1 }]);
    setError("");
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }
    const validItems = items.filter((i) => i.product_id);
    if (validItems.length === 0) {
      setError("At least one item with a product is required.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const body: OrderCreateInput = {
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim() || undefined,
        items: validItems.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
      };
      await api.createOrder(body);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["recent-orders"] });
      reset();
      onOpenChange(false);
    } catch {
      setError("Failed to create order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const addItem = () => {
    setItems((prev) => [...prev, { product_id: "", quantity: 1 }]);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: "product_id" | "quantity", value: string | number) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New order</DialogTitle>
          <DialogDescription>Create a new order with line items.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Customer name *</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Acme Inc."
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Customer email</label>
            <input
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="orders@example.com"
              type="email"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Items *</label>
              <button
                onClick={addItem}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" /> Add item
              </button>
            </div>
            <div className="mt-1 space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="flex-1">
                    <Select
                      value={item.product_id}
                      onValueChange={(v) => updateItem(idx, "product_id", v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {(products ?? []).map((p) => (
                          <SelectItem key={p.id} value={p.id} className="text-xs">
                            {p.name} ({p.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, "quantity", Math.max(1, Number(e.target.value)))}
                      className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-center outline-none focus:ring-1 focus:ring-ring font-mono"
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(idx)}
                      className="mt-1 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-[var(--color-destructive)]">{error}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              onClick={() => { reset(); onOpenChange(false); }}
              className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create order"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
