import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/shell/brand";
import { AuthProvider, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Gateway" }] }),
  component: () => (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  ),
});

function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@gateway.io");
  const [password, setPassword] = useState("demo");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      nav({ to: "/" });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-background text-foreground">
      <aside className="relative hidden lg:flex flex-col justify-between p-12 border-r border-border bg-sidebar">
        <div className="flex items-center gap-2">
          <BrandMark className="h-5 w-5 text-foreground" />
          <span className="font-semibold tracking-tight">Gateway</span>
          <span className="ml-2 rounded border border-border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Enterprise
          </span>
        </div>

        <div className="space-y-8 max-w-md">
          <h2 className="text-[32px] font-semibold tracking-[-0.02em] leading-[1.1]">
            Inventory and order operations,
            <span className="text-muted-foreground"> unified across every warehouse.</span>
          </h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-6">
            <Stat k="99.99%" v="Uptime SLA" />
            <Stat k="< 50ms" v="P95 API latency" />
            <Stat k="SOC 2" v="Type II certified" />
            <Stat k="SAML SSO" v="& SCIM provisioning" />
          </dl>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono">© {new Date().getFullYear()} Gateway, Inc.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Status</a>
          </div>
        </div>
      </aside>

      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[360px] space-y-7">
          <div className="lg:hidden flex items-center gap-2">
            <BrandMark className="h-5 w-5 text-foreground" />
            <span className="font-semibold tracking-tight">Gateway</span>
          </div>
          <div className="space-y-1.5">
            <h1 className="text-[22px] font-semibold tracking-tight">Sign in to your workspace</h1>
            <p className="text-[13px] text-muted-foreground">
              Use your corporate identity provider or email below.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <SsoButton label="SAML SSO" />
            <SsoButton label="Google" />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-background px-2 text-[11px] uppercase tracking-wider text-muted-foreground">or with email</span></div>
          </div>

          <form onSubmit={onSubmit} className="space-y-3.5">
            <Field label="Work email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-md border border-border bg-background px-3 h-9 text-sm outline-none focus:ring-2 focus:ring-ring/30 focus:border-foreground/30 transition-shadow"
              />
            </Field>
            <Field label="Password" right={<a href="#" className="text-[11px] text-muted-foreground hover:text-foreground">Forgot?</a>}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-md border border-border bg-background px-3 h-9 text-sm outline-none focus:ring-2 focus:ring-ring/30 focus:border-foreground/30 transition-shadow"
              />
            </Field>

            {err && (
              <p className="text-xs text-[var(--color-destructive)]">{err}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 h-9 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {loading ? "Signing in…" : (<>Continue <ArrowRight className="h-3.5 w-3.5" /></>)}
            </button>
          </form>

          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            Protected by enterprise-grade encryption. By continuing you agree to our{" "}
            <a href="#" className="text-foreground hover:underline">Terms</a> and{" "}
            <a href="#" className="text-foreground hover:underline">Acceptable Use Policy</a>.
          </p>
        </div>
      </main>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="font-mono text-base font-semibold tracking-tight">{k}</div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">{v}</div>
    </div>
  );
}

function SsoButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-3 h-9 text-[13px] font-medium hover:bg-muted/50 transition-colors"
    >
      {label}
    </button>
  );
}

function Field({ label, right, children }: { label: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        {right}
      </span>
      {children}
    </label>
  );
}
