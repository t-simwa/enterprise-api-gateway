import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/shell/sidebar";
import { Header } from "@/components/shell/header";
import { CommandPalette } from "@/components/shell/command-palette";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    document.documentElement.classList.toggle("dark", stored ? stored === "dark" : true);
  }, []);

  return (
    <AuthProvider>
      <SidebarProvider>
        <Sidebar />
        <SidebarInset>
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
        </SidebarInset>
        <CommandPalette />
        <Toaster position="bottom-right" />
      </SidebarProvider>
    </AuthProvider>
  );
}
