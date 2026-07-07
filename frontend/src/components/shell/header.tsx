import { Link, useRouterState } from "@tanstack/react-router";
import { Search, Moon, Sun, ChevronRight, ChevronsUpDown, Globe, Check, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BrandMark } from "./brand";
import { Notifications } from "./notifications";
import { openCommandPalette } from "./command-palette";

const ORGS = [
  { id: "acme", name: "Acme Inc.", plan: "Enterprise" },
  { id: "dev", name: "Development", plan: "Free" },
  { id: "staging", name: "Staging", plan: "Pro" },
] as const;

const REGIONS = [
  { id: "us-east-1", label: "N. Virginia", baseLatency: 42 },
  { id: "us-west-2", label: "Oregon", baseLatency: 78 },
  { id: "eu-west-1", label: "Ireland", baseLatency: 89 },
  { id: "eu-central-1", label: "Frankfurt", baseLatency: 112 },
  { id: "ap-southeast-1", label: "Singapore", baseLatency: 156 },
] as const;

function randomLatency(base: number): string {
  const jitter = Math.floor(Math.random() * 21) - 5;
  return `${Math.max(10, base + jitter)}ms`;
}

function loadOrg(): string {
  try { return localStorage.getItem("eag.org") || "acme"; } catch { return "acme"; }
}

function loadRegion(): string {
  try { return localStorage.getItem("eag.region") || "us-east-1"; } catch { return "us-east-1"; }
}

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
  docs: "Documentation",
  support: "Support",
};

function OrgSwitcher() {
  const [orgId, setOrgId] = useState(loadOrg);
  const current = ORGS.find((o) => o.id === orgId) ?? ORGS[0];

  const switchOrg = (id: string) => {
    setOrgId(id);
    localStorage.setItem("eag.org", id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-muted/60 text-foreground cursor-pointer">
          <span className="font-medium">{current.name}</span>
          <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-screen sm:w-[240px] p-1">
        {ORGS.map((org) => (
          <DropdownMenuItem key={org.id} onSelect={() => switchOrg(org.id)} className="cursor-pointer">
            <div className="flex items-center gap-3 w-full">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-[11px] font-semibold">
                {org.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm">{org.name}</div>
                <div className="text-[11px] text-muted-foreground">{org.plan}</div>
              </div>
              {org.id === orgId && <Check className="h-3.5 w-3.5 text-foreground shrink-0" />}
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs text-muted-foreground cursor-pointer gap-2">
          <Users className="h-3.5 w-3.5" />
          Manage organizations
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RegionSelector() {
  const [regionId, setRegionId] = useState(loadRegion);
  const [latencies, setLatencies] = useState<Record<string, string>>({});
  const [measuring, setMeasuring] = useState(false);
  const [open, setOpen] = useState(false);
  const current = REGIONS.find((r) => r.id === regionId) ?? REGIONS[0];

  useEffect(() => {
    if (open && !measuring) {
      setMeasuring(true);
      setLatencies({});
      const timer = setTimeout(() => {
        const next: Record<string, string> = {};
        for (const r of REGIONS) next[r.id] = randomLatency(r.baseLatency);
        setLatencies(next);
        setMeasuring(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const select = (id: string) => {
    setRegionId(id);
    localStorage.setItem("eag.region", id);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border h-8 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer sm:rounded-full sm:px-2 sm:py-0.5">
          <Globe className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">{current.id}</span>
          <span className="hidden sm:inline font-mono">·</span>
          <span className="font-mono hidden sm:inline">{latencies[current.id] || "—"}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-screen sm:w-56 p-1" sideOffset={6}>
        <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Select region</div>
        {measuring && (
          <div className="px-2 py-3 text-center text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" />
              Measuring latency…
            </span>
          </div>
        )}
        {!measuring && REGIONS.map((r) => {
          const latency = latencies[r.id] ?? "—";
          const selected = r.id === regionId;
          return (
            <button
              key={r.id}
              onClick={() => select(r.id)}
              className={
                "flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm cursor-pointer " +
                (selected ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground")
              }
            >
              <div className="flex-1 min-w-0">
                <div className={selected ? "font-medium" : ""}>{r.id}</div>
                <div className="text-[11px] text-muted-foreground">{r.label}</div>
              </div>
              <span className="font-mono text-xs tabular-nums">{latency}</span>
              {selected && <Check className="h-3 w-3 shrink-0" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

export function Header() {
  const { dark, toggle, mounted } = useTheme();
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
        <OrgSwitcher />
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
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={openCommandPalette}
          className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60 sm:w-auto sm:px-2.5 sm:gap-2 transition-colors"
          aria-label="Search"
        >
          <Search className="h-3 w-3 shrink-0" />
          <span className="hidden sm:flex items-center text-[13px]">Search or run a command…</span>
          <kbd className="hidden sm:inline">⌘K</kbd>
        </button>
        <RegionSelector />
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
      </div>
    </header>
  );
}
