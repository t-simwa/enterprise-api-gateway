import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Menu, X, ChevronRight } from "lucide-react";

interface Section {
  label: string;
  items: { to: string; label: string }[];
}

const SECTIONS: Section[] = [
  {
    label: "Getting started",
    items: [
      { to: "/docs", label: "Overview" },
      { to: "/docs/getting-started", label: "Quick start" },
    ],
  },
  {
    label: "Guides",
    items: [
      { to: "/docs/orders", label: "Orders" },
      { to: "/docs/products", label: "Products" },
      { to: "/docs/inventory", label: "Inventory" },
    ],
  },
  {
    label: "Reference",
    items: [
      { to: "/docs/api-reference", label: "API reference" },
    ],
  },
];

const FLAT = SECTIONS.flatMap((s) => s.items);

export function DocSidebar({ className, onNav }: { className?: string; onNav?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [q, setQ] = useState("");

  const filtered = q.trim()
    ? FLAT.filter((item) => item.label.toLowerCase().includes(q.toLowerCase()))
    : null;

  return (
    <aside className={"border-r border-border bg-background overflow-y-auto " + (className ?? "")}>
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search docs…"
            className="w-full rounded-md border border-border bg-muted/30 pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <nav className="px-3 pb-4">
        {(filtered ?? FLAT).length === 0 && q.trim() && (
          <p className="px-2 py-4 text-xs text-center text-muted-foreground">No results for "{q}"</p>
        )}
        {(filtered ?? null) === null && SECTIONS.map((section) => (
          <div key={section.label} className="mb-4">
            <div className="px-2 mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {section.label}
            </div>
            {section.items.map((item) => {
              const active = item.to === "/docs" ? pathname === "/docs" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to as "/docs" | "/docs/getting-started" | "/docs/orders" | "/docs/products" | "/docs/inventory" | "/docs/api-reference"}
                  onClick={onNav}
                  className={
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer " +
                    (active
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40")
                  }
                >
                  {active && <ChevronRight className="h-3 w-3 shrink-0" />}
                  <span className={active ? "" : "ml-5"}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
        {filtered && filtered.map((item) => (
          <Link
            key={item.to}
            to={item.to as "/docs" | "/docs/getting-started" | "/docs/orders" | "/docs/products" | "/docs/inventory" | "/docs/api-reference"}
            onClick={onNav}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 cursor-pointer"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export function MobileDocSidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex lg:hidden h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60"
      aria-label="Toggle docs navigation"
    >
      <Menu className="h-4 w-4" />
    </button>
  );
}

export function MobileDocSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={onClose} />
      )}
      <div
        className={
          "fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border shadow-lg transition-transform duration-200 lg:hidden " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="flex items-center justify-between p-3 border-b border-border">
          <span className="text-sm font-semibold">Documentation</span>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted/60">
            <X className="h-4 w-4" />
          </button>
        </div>
        <DocSidebar onNav={onClose} />
      </div>
    </>
  );
}
