import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { DocSidebar, MobileDocSidebarTrigger, MobileDocSidebar } from "@/components/docs/docs-sidebar";

export const Route = createFileRoute("/_app/docs")({
  head: () => ({ meta: [{ title: "Docs — Gateway" }] }),
  component: DocsLayout,
});

function DocsLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-0 flex-1">
      <DocSidebar className="hidden lg:block w-60 shrink-0" />
      <MobileDocSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="flex-1 min-w-0 px-4 sm:px-6 py-8 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          <MobileDocSidebarTrigger onClick={() => setMobileOpen(true)} />
          <span className="text-sm font-semibold">Documentation</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
