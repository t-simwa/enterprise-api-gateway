import { Bell, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAuth } from "@/lib/auth";

interface Notification {
  id: string;
  kind: "ok" | "warn" | "info";
  title: string;
  body: string;
  at: string;
}

function Icon({ kind }: { kind: Notification["kind"] }) {
  if (kind === "warn") return <AlertTriangle className="h-3.5 w-3.5 text-[var(--color-warning)]" />;
  if (kind === "ok") return <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success)]" />;
  return <Info className="h-3.5 w-3.5 text-[var(--color-info)]" />;
}

export function Notifications() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<Notification[]>([
    { id: "1", kind: "warn", title: "Low stock alert", body: "12 SKUs below reorder point in EU-Central", at: "12m" },
    { id: "2", kind: "info", title: "Webhook deployed", body: "orders.shipped → fulfillment v3.4", at: "1h" },
    { id: "3", kind: "ok", title: "SOC 2 evidence collected", body: "Quarterly control review passed", at: "3h" },
    { id: "4", kind: "info", title: "New API key issued", body: "key_prod_••••a91 by jordan@acme.io", at: "Yesterday" },
  ]);

  const handleLowStock = useCallback((msg: Record<string, unknown>) => {
    const n: Notification = {
      id: `ws-${Date.now()}`,
      kind: "warn",
      title: "Low stock alert",
      body: `${msg.product_name} (SKU: ${msg.sku}) — ${msg.current_stock} units remaining, reorder at ${msg.reorder_point}`,
      at: "now",
    };
    setItems((prev) => [n, ...prev].slice(0, 20));
    toast.warning(n.title, { description: n.body });
  }, []);

  useWebSocket(accessToken, { low_stock_alert: handleLowStock });

  const dismiss = (id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60"
        >
          <Bell className="h-4 w-4" />
          {items.some((n) => n.kind === "warn") && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--color-warning)] ring-2 ring-background" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
          <div className="text-sm font-semibold">Notifications</div>
          <button
            onClick={() => setItems([])}
            className="text-[11px] text-muted-foreground hover:text-foreground"
          >
            Clear all
          </button>
        </div>
        <ul className="max-h-[360px] overflow-y-auto divide-y divide-border">
          {items.length === 0 && (
            <li className="px-3.5 py-6 text-center text-xs text-muted-foreground">
              No notifications
            </li>
          )}
          {items.map((n) => (
            <li key={n.id} className="group flex items-start gap-3 px-3.5 py-3 hover:bg-muted/40">
              <div className="mt-0.5"><Icon kind={n.kind} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-[13px] font-medium">{n.title}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{n.at}</div>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{n.body}</div>
              </div>
              <button
                onClick={() => dismiss(n.id)}
                className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-border px-3.5 py-2 text-center">
          <button className="text-[12px] text-muted-foreground hover:text-foreground">View all activity</button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
