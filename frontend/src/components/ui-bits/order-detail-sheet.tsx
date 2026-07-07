import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Package } from "lucide-react";
import { api, formatUSD, type OrderDetail } from "@/lib/api";
import { StatusBadge } from "./status-badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface Props {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailSheet({ orderId, open, onOpenChange }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api.orderDetail(orderId!),
    enabled: !!orderId && open,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-5 w-32 rounded bg-muted animate-pulse" />
              <div className="h-4 w-48 rounded bg-muted animate-pulse" />
            </div>
          ) : data ? (
            <>
              <div className="flex items-center gap-3">
                <SheetTitle className="font-mono text-base">{data.order_number}</SheetTitle>
                <StatusBadge status={data.status} />
              </div>
              <SheetDescription>
                Created {new Date(data.created_at).toLocaleString(undefined, {
                  month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </SheetDescription>
            </>
          ) : null}
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 w-full rounded bg-muted animate-pulse" />
            ))}
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Customer section */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Customer
              </h3>
              <p className="text-sm font-medium">{data.customer_name}</p>
              <p className="text-xs text-muted-foreground">{data.customer_email}</p>
            </div>

            {/* Items section */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Items ({data.items.length})
              </h3>
              <div className="rounded-lg border border-border divide-y divide-border">
                {data.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <Package className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-mono">{formatUSD(item.unit_price)}</p>
                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0 min-w-[72px]">
                      <p className="text-sm font-mono font-medium">
                        {formatUSD(item.unit_price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals row */}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total
              </span>
              <span className="text-lg font-semibold font-mono">{formatUSD(data.total_amount)}</span>
            </div>

            {/* Timeline section */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Timeline
              </h3>
              <div className="space-y-3">
                {data.timeline.map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="size-2 rounded-full bg-muted-foreground/30 mt-1.5" />
                      {i < data.timeline.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-1" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm capitalize">{t.status}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {new Date(t.timestamp).toLocaleString(undefined, {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Order not found.</p>
        )}
      </SheetContent>
    </Sheet>
  );
}
