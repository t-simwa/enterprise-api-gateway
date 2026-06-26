import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { isMock } from "@/lib/api";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Gateway" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, logout } = useAuth();
  const rawBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const base = rawBase && rawBase !== "mock" ? rawBase.replace(/\/$/, "") : isMock ? "(mock)" : "(proxy)";

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Workspace and connection.</p>
      </div>

      <section className="rounded-lg border border-border bg-card">
        <header className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold">Account</h2>
        </header>
        <div className="divide-y divide-border">
          <Row label="Name" value={user?.full_name ?? "—"} />
          <Row label="Email" value={user?.email ?? "—"} />
          <Row label="Role" value={user?.role ?? "—"} />
        </div>
        <footer className="border-t border-border px-5 py-3 flex justify-end">
          <button
            onClick={logout}
            className="inline-flex rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted/40"
          >
            Sign out
          </button>
        </footer>
      </section>

      <section className="rounded-lg border border-border bg-card">
        <header className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold">Backend connection</h2>
        </header>
        <div className="divide-y divide-border">
          <Row
            label="Mode"
            value={
              isMock ? (
                <span className="inline-flex items-center gap-1.5 text-[var(--color-warning)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-warning)]" />
                  Demo data
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[var(--color-success)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
                  Live
                </span>
              )
            }
          />
          <Row label="API base URL" value={<span className="font-mono text-xs">{base || "(not set)"}</span>} />
        </div>
        <footer className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
          Set <code className="font-mono">VITE_API_BASE_URL</code> at build time to point at your FastAPI backend (e.g. <code className="font-mono">https://api.example.com</code>).
        </footer>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
