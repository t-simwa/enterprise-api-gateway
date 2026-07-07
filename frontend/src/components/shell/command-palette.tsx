import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  BarChart3,
  Settings,
  Sun,
  Moon,
  LogOut,
  BookOpen,
  LifeBuoy,
  Plus,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api, formatUSD } from "@/lib/api";
import { StatusBadge } from "@/components/ui-bits/status-badge";

void Command;

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard, shortcut: "G O" },
  { to: "/orders", label: "Orders", icon: ShoppingCart, shortcut: "G R" },
  { to: "/products", label: "Products", icon: Package, shortcut: "G P" },
  { to: "/inventory", label: "Inventory", icon: Warehouse, shortcut: "G I" },
  { to: "/analytics", label: "Analytics", icon: BarChart3, shortcut: "G A" },
  { to: "/settings", label: "Settings", icon: Settings, shortcut: "G S" },
] as const;

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: orders } = useQuery({ queryKey: ["orders"], queryFn: api.allOrders });
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: api.products });
  const { data: inventory } = useQuery({ queryKey: ["inventory"], queryFn: api.inventory });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    (window as unknown as { __openCmdK?: () => void }).__openCmdK = () => setOpen(true);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const go = (to: string) => {
    setOpen(false);
    navigate({ to });
  };

  const goWithDetail = (to: string, detailId: string) => {
    setOpen(false);
    navigate({ to, state: { detailId } as unknown as Record<string, unknown> });
  };

  const toggleTheme = () => {
    setOpen(false);
    const dark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Type a command or search…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {NAV.map((item) => (
            <CommandItem key={item.to} onSelect={() => go(item.to)}>
              <item.icon />
              <span>{item.label}</span>
              <CommandShortcut>{item.shortcut}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => go("/orders")}>
            <Plus />
            <span>Create new order</span>
            <CommandShortcut>C</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={toggleTheme}>
            <Sun />
            <span>Toggle theme</span>
            <CommandShortcut>⌘⇧L</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => { setOpen(false); logout(); }}>
            <LogOut />
            <span>Sign out</span>
          </CommandItem>
        </CommandGroup>

        {query && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Orders">
              {orders?.map((o) => (
                <CommandItem key={o.id} onSelect={() => goWithDetail("/orders", o.id)}>
                  <ShoppingCart className="size-4" />
                  <span>{o.order_number}</span>
                  <span className="text-muted-foreground text-xs ml-1.5">{o.customer_name}</span>
                  <span className="ml-auto">
                    <StatusBadge status={o.status} />
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Products">
              {products?.map((p) => (
                <CommandItem key={p.id} onSelect={() => goWithDetail("/products", p.id)}>
                  <Package className="size-4" />
                  <span>{p.name}</span>
                  <span className="text-muted-foreground text-xs ml-2">{p.sku}</span>
                  <span className="ml-auto text-xs font-mono tabular-nums text-muted-foreground">
                    {formatUSD(p.unit_price)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Inventory">
              {inventory?.map((i) => (
                <CommandItem key={`${i.product_id}-${i.warehouse}`} onSelect={() => goWithDetail("/inventory", i.product_id)}>
                  <Warehouse className="size-4" />
                  <span>{i.name}</span>
                  <span className="text-muted-foreground text-xs ml-2">{i.warehouse}</span>
                  <span className="ml-auto flex items-center gap-1.5">
                    <span
                      className={`size-1.5 rounded-full ${i.available <= 5 ? "bg-[var(--color-destructive)]" : "bg-[var(--color-success)]"}`}
                    />
                    <span className="font-mono text-xs tabular-nums">{i.available} avail.</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Help">
          <CommandItem onSelect={() => go("/docs")}>
            <BookOpen />
            <span>Documentation</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/support")}>
            <LifeBuoy />
            <span>Contact support</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function openCommandPalette() {
  (window as unknown as { __openCmdK?: () => void }).__openCmdK?.();
}
