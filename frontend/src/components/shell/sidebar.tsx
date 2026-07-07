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
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
  { to: "/docs", label: "Documentation", icon: BookOpen },
  { to: "/support", label: "Support", icon: LifeBuoy },
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { state, isMobile, setOpenMobile } = useSidebar();
  const closeMobile = () => { if (isMobile) setOpenMobile(false); };

  return (
    <SidebarRoot collapsible="icon">
      <SidebarHeader className="flex flex-row h-14 items-center gap-2 border-b border-border px-4 py-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <div className="group-data-[collapsible=icon]:flex hidden items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <BrandMark className="h-5 w-5 cursor-pointer text-sidebar-foreground" />
            </TooltipTrigger>
            <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile}>
              Gateway
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
          <BrandMark className="h-5 w-5 shrink-0 text-sidebar-foreground" />
          <span className="text-sm font-semibold tracking-tight">Gateway</span>
        </div>
        <span className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground group-data-[collapsible=icon]:hidden">
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
                  <SidebarMenuButton asChild isActive={active} tooltip={label}>
                    <Link to={to} onClick={closeMobile}>
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
                  <SidebarMenuButton asChild isActive={active} tooltip={label}>
                    <Link to={to} onClick={closeMobile}>
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
            {RESOURCES.map(({ to, label, icon: Icon }) => {
              const active = pathname.startsWith(to);
              return (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton asChild isActive={active} tooltip={label}>
                    <Link to={to} onClick={closeMobile}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border px-3 py-2.5 text-[11px] text-muted-foreground">
        <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <span className="font-mono group-data-[collapsible=icon]:hidden">v1.0.0</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-success)] opacity-60 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
                </span>
                <span className="group-data-[collapsible=icon]:hidden">All systems normal</span>
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile}>
              All systems normal
            </TooltipContent>
          </Tooltip>
        </div>
      </SidebarFooter>
    </SidebarRoot>
  );
}
