import { cn } from "@/lib/utils";

const MAP: Record<string, { dot: string; text: string }> = {
  pending: { dot: "bg-[var(--color-warning)]", text: "text-[var(--color-warning)]" },
  processing: { dot: "bg-[var(--color-info)]", text: "text-[var(--color-info)]" },
  shipped: { dot: "bg-[var(--color-info)]", text: "text-[var(--color-info)]" },
  delivered: { dot: "bg-[var(--color-success)]", text: "text-[var(--color-success)]" },
  cancelled: { dot: "bg-[var(--color-destructive)]", text: "text-[var(--color-destructive)]" },
  active: { dot: "bg-[var(--color-success)]", text: "text-[var(--color-success)]" },
  inactive: { dot: "bg-muted-foreground", text: "text-muted-foreground" },
};

export function StatusBadge({ status }: { status: string }) {
  const m = MAP[status] ?? MAP.inactive;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs">
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      <span className={cn("font-medium capitalize", m.text)}>{status}</span>
    </span>
  );
}
