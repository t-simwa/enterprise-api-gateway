import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductFormDialog({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [reorderPoint, setReorderPoint] = useState("10");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setSku("");
    setName("");
    setCategory("");
    setUnitPrice("");
    setReorderPoint("10");
    setError("");
  };

  const handleSubmit = async () => {
    if (!sku.trim()) { setError("SKU is required."); return; }
    if (!name.trim()) { setError("Product name is required."); return; }
    if (!unitPrice || Number(unitPrice) <= 0) { setError("Unit price must be greater than 0."); return; }

    setSubmitting(true);
    setError("");
    try {
      await api.createProduct({
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        category: category.trim() || undefined,
        unit_price: Number(unitPrice),
        reorder_point: Math.max(0, Number(reorderPoint)),
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      reset();
      onOpenChange(false);
    } catch {
      setError("Failed to create product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add product</DialogTitle>
          <DialogDescription>Add a new SKU to the product catalog.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">SKU *</label>
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU-1001"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Unit price ($) *</label>
              <input
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="29.99"
                type="number"
                step="0.01"
                min="0.01"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Product name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Titanium Bolt M8"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Hardware"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Reorder point</label>
              <input
                value={reorderPoint}
                onChange={(e) => setReorderPoint(e.target.value)}
                type="number"
                min="0"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring font-mono"
              />
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
              {submitting ? "Creating…" : "Add product"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
