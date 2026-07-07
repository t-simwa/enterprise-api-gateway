import { useQuery } from "@tanstack/react-query";
import { Package, Warehouse, CircleDollarSign } from "lucide-react";
import { api, formatUSD, type Product, type InventoryRow } from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface Props {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailSheet({ productId, open, onOpenChange }: Props) {
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: api.products,
    enabled: open,
  });
  const { data: inventory } = useQuery({
    queryKey: ["inventory"],
    queryFn: api.inventory,
    enabled: open,
  });

  const product: Product | undefined = products?.find((p) => p.id === productId);
  const inventoryRows: InventoryRow[] = inventory?.filter((r) => r.product_id === productId) ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          {product ? (
            <>
              <SheetTitle>{product.name}</SheetTitle>
              <SheetDescription>
                <span className="font-mono">{product.sku}</span>
                {product.category && (
                  <>
                    <span className="mx-1.5 text-muted-foreground/50">·</span>
                    {product.category}
                  </>
                )}
              </SheetDescription>
            </>
          ) : (
            <div className="space-y-2">
              <div className="h-5 w-40 rounded bg-muted animate-pulse" />
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            </div>
          )}
        </SheetHeader>

        {product ? (
          <div className="space-y-6">
            {/* Pricing & details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <CircleDollarSign className="size-3" />
                  Unit price
                </div>
                <p className="text-lg font-semibold font-mono">{formatUSD(product.unit_price)}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Package className="size-3" />
                  Reorder point
                </div>
                <p className="text-lg font-semibold font-mono">{product.reorder_point}</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${product.is_active ? "bg-[var(--color-success)]" : "bg-muted-foreground"}`}
              />
              <span className="text-sm capitalize">{product.is_active ? "Active" : "Inactive"}</span>
            </div>

            {/* Inventory across warehouses */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Inventory by warehouse
              </h3>
              {inventoryRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">No inventory records.</p>
              ) : (
                <div className="space-y-1.5">
                  {inventoryRows.map((row) => (
                    <div
                      key={row.warehouse}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Warehouse className="size-3.5 text-muted-foreground" />
                        <span className="text-sm">{row.warehouse}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-mono tabular-nums">
                        <span className="text-muted-foreground">{row.quantity} on hand</span>
                        <span
                          className={
                            row.available <= 5
                              ? "text-[var(--color-destructive)]"
                              : "text-[var(--color-success)]"
                          }
                        >
                          {row.available} avail.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total stock summary */}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total stock
              </span>
              <span className="font-mono font-semibold">
                {inventoryRows.reduce((s, r) => s + r.quantity, 0)} units
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Product not found.</p>
        )}
      </SheetContent>
    </Sheet>
  );
}
