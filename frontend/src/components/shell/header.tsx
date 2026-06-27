import { Link, useRouterState } from "@tanstack/react-router";
import { Search, Moon, Sun, ChevronRight, ChevronsUpDown, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BrandMark } from "./brand";
import { Notifications } from "./notifications";
import { openCommandPalette } from "./command-palette";

function useTheme() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored ? stored === "dark" : true;
    document.documentElement.classList.toggle("dark", isDark);
    setDark(isDark);
    setMounted(true);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };
  return { dark, toggle, mounted };
}

const LABELS: Record<string, string> = {
  orders: "Orders",
  products: "Products",
  inventory: "Inventory",
  analytics: "Analytics",
  settings: "Settings",
};

export function Header() {
  const { dark, toggle, mounted } = useTheme();
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/65">
      <div className="flex md:hidden items-center gap-2">
        <SidebarTrigger />
        <Link to="/" className="flex items-center gap-2">
          <BrandMark />
          <span className="text-sm font-semibold tracking-tight">Gateway</span>
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-0 text-[13px]">
        <SidebarTrigger className="-ml-2 mr-1 data-[state=collapsed]:rotate-180" />
        <button className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-muted/60 text-foreground">
          <span className="font-medium">Acme Inc.</span>
          <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
        </button>
        <span className="text-muted-foreground/60">/</span>
        <Link to="/" className="text-muted-foreground hover:text-foreground rounded px-1 py-0.5">
          Production
        </Link>
        {segments.length > 0 && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="font-medium">{LABELS[segments[segments.length - 1]] ?? segments[segments.length - 1]}</span>
          </>
        )}
        <span className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-success)] opacity-60 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
          </span>
          Operational
        </span>
        <span className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground">
          <Globe className="h-3 w-3" />
          us-east-1 · <span className="font-mono">42ms</span>
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={openCommandPalette}
          className="hidden sm:flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2.5 h-8 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 w-72 transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left text-[13px]">Search or run a command…</span>
          <kbd>⌘K</kbd>
        </button>
        <Notifications />
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          suppressHydrationWarning
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60"
        >
          {mounted ? (
            dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
          ) : (
            <span className="h-4 w-4" />
          )}
        </button>
        <div className="flex items-center gap-2 pl-2 ml-1 border-l border-border">
          <div className="h-7 w-7 rounded-full bg-foreground text-background grid place-items-center text-[11px] font-semibold">
            {(user?.full_name ?? "A").slice(0, 1).toUpperCase()}
          </div>
          <button
            onClick={logout}
            className="hidden sm:inline text-xs text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
