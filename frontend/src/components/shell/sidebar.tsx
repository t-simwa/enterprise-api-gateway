import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  BarChart3,
  Settings,
  LifeBuoy,
  BookOpen,
} from "lucide-react";
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BrandMark } from "./brand";

const PRIMARY = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/products", label: "Products", icon: Package },
  { to: "/inventory", label: "Inventory", icon: Warehouse },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

const SECONDARY = [
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const RESOURCES = [
  { href: "https://docs.example.com", label: "Documentation", icon: BookOpen },
  { href: "mailto:support@example.com", label: "Support", icon: LifeBuoy },
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <SidebarRoot>
      <SidebarHeader className="flex h-14 items-center gap-2 border-b border-border px-4">
        <BrandMark className="h-4 w-4" />
        <span className="text-sm font-semibold tracking-tight">Gateway</span>
        <span className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Prod
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            {PRIMARY.map(({ to, label, icon: Icon }) => {
              const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
              return (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton asChild isActive={active}>
                    <Link to={to}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarMenu>
            {SECONDARY.map(({ to, label, icon: Icon }) => {
              const active = pathname.startsWith(to);
              return (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton asChild isActive={active}>
                    <Link to={to}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarMenu>
            {RESOURCES.map(({ href, label, icon: Icon }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton asChild>
                  <a href={href} target="_blank" rel="noreferrer">
                    <Icon />
                    <span>{label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border px-3 py-2.5 text-[11px] text-muted-foreground">
        <div className="flex items-center justify-between">
          <span className="font-mono">v1.0.0</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-success)] opacity-60 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
            </span>
            All systems normal
          </span>
        </div>
      </SidebarFooter>
    </SidebarRoot>
  );
}
