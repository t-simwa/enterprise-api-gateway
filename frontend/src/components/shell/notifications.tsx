import { Bell, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
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
  read: boolean;
}

const STORAGE_KEY = "eag.notifications";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
}

function isYesterday(iso: string): boolean {
  const d = new Date(iso);
  const t = new Date();
  t.setDate(t.getDate() - 1);
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
}

function Icon({ kind }: { kind: Notification["kind"] }) {
  if (kind === "warn") return <AlertTriangle className="h-3.5 w-3.5 text-[var(--color-warning)]" />;
  if (kind === "ok") return <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success)]" />;
  return <Info className="h-3.5 w-3.5 text-[var(--color-info)]" />;
}

function loadNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  const now = Date.now();
  return [
    { id: "1", kind: "warn", title: "Low stock alert", body: "12 SKUs below reorder point in EU-Central", at: new Date(now - 12 * 60000).toISOString(), read: false },
    { id: "2", kind: "info", title: "Webhook deployed", body: "orders.shipped → fulfillment v3.4", at: new Date(now - 60 * 60000).toISOString(), read: false },
    { id: "3", kind: "ok", title: "SOC 2 evidence collected", body: "Quarterly control review passed", at: new Date(now - 3 * 3600000).toISOString(), read: false },
    { id: "4", kind: "info", title: "New API key issued", body: "key_prod_••••a91 by jordan@acme.io", at: new Date(now - 24 * 3600000).toISOString(), read: false },
  ];
}

function persistNotifications(items: Notification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function Notifications() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<Notification[]>(loadNotifications);

  useEffect(() => {
    persistNotifications(items);
  }, [items]);

  const handleLowStock = useCallback((msg: Record<string, unknown>) => {
    const n: Notification = {
      id: `ws-${Date.now()}`,
      kind: "warn",
      title: "Low stock alert",
      body: `${msg.product_name} (SKU: ${msg.sku}) — ${msg.current_stock} units remaining, reorder at ${msg.reorder_point}`,
      at: new Date().toISOString(),
      read: false,
    };
    setItems((prev) => [n, ...prev].slice(0, 50));
    toast.warning(n.title, { description: n.body });
  }, []);

  useWebSocket(accessToken, { low_stock_alert: handleLowStock });

  const unread = items.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const dismiss = (id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setItems([]);
  };

  const today: Notification[] = [];
  const yesterday: Notification[] = [];
  const older: Notification[] = [];
  for (const n of items) {
    if (isToday(n.at)) today.push(n);
    else if (isYesterday(n.at)) yesterday.push(n);
    else older.push(n);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-warning)] px-1 text-[10px] font-medium text-background ring-2 ring-background">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-screen sm:w-[380px] p-0">
        <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
          <div className="text-sm font-semibold">
            Notifications
            {unread > 0 && (
              <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground">
                {unread}
              </span>
            )}
          </div>
          {items.length > 0 && (
            <button onClick={clearAll} className="text-[11px] text-muted-foreground hover:text-foreground">
              Clear all
            </button>
          )}
        </div>
        <ul className="max-h-[400px] overflow-y-auto divide-y divide-border">
          {items.length === 0 && (
            <li className="px-3.5 py-12 text-center text-xs text-muted-foreground">
              No notifications
            </li>
          )}
          {today.length > 0 && (
            <li className="px-3.5 pt-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Today</li>
          )}
          {today.map((n) => (
            <NotificationRow key={n.id} n={n} onRead={markRead} onDismiss={dismiss} />
          ))}
          {yesterday.length > 0 && (
            <li className="px-3.5 pt-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Yesterday</li>
          )}
          {yesterday.map((n) => (
            <NotificationRow key={n.id} n={n} onRead={markRead} onDismiss={dismiss} />
          ))}
          {older.length > 0 && (
            <li className="px-3.5 pt-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Older</li>
          )}
          {older.map((n) => (
            <NotificationRow key={n.id} n={n} onRead={markRead} onDismiss={dismiss} />
          ))}
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationRow({ n, onRead, onDismiss }: { n: Notification; onRead: (id: string) => void; onDismiss: (id: string) => void }) {
  return (
    <li
      className={"group flex items-start gap-3 px-3.5 py-3 hover:bg-muted/40 cursor-pointer " + (n.read ? "opacity-60" : "")}
      onClick={() => onRead(n.id)}
    >
      <div className="mt-0.5"><Icon kind={n.kind} /></div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className={"truncate text-[13px] " + (n.read ? "" : "font-medium")}>{n.title}</div>
          <div className="font-mono text-[10px] text-muted-foreground shrink-0">{relativeTime(n.at)}</div>
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">{n.body}</div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(n.id); }}
        className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </li>
  );
}
