import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
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
  const navigate = useNavigate();
  const { logout } = useAuth();

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

  const go = (to: string) => {
    setOpen(false);
    navigate({ to });
  };

  const toggleTheme = () => {
    setOpen(false);
    const dark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search…" />
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
        <CommandSeparator />
        <CommandGroup heading="Help">
          <CommandItem onSelect={() => window.open("https://docs.example.com", "_blank")}>
            <BookOpen />
            <span>Documentation</span>
          </CommandItem>
          <CommandItem onSelect={() => window.open("mailto:support@example.com", "_blank")}>
            <LifeBuoy />
            <span>Contact support</span>
          </CommandItem>
          <CommandItem onSelect={toggleTheme}>
            <Moon />
            <span>Dark mode</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function openCommandPalette() {
  (window as unknown as { __openCmdK?: () => void }).__openCmdK?.();
}
