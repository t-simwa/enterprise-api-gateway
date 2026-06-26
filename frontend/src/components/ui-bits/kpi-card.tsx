import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  delta?: number; // percent
  hint?: string;
  loading?: boolean;
  spark?: number[];
}

export function KpiCard({ label, value, delta, hint, loading, spark }: Props) {
  const positive = (delta ?? 0) > 0;
  const neutral = (delta ?? 0) === 0;

  return (
    <div className="group relative rounded-lg border border-border bg-card p-5 transition-colors hover:border-foreground/25">
      <div className="flex items-start justify-between">
        <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </div>
        {typeof delta === "number" && !loading && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium tabular",
              neutral
                ? "border-border text-muted-foreground"
                : positive
                  ? "border-[color-mix(in_oklab,var(--color-success)_35%,transparent)] text-[var(--color-success)]"
                  : "border-[color-mix(in_oklab,var(--color-destructive)_35%,transparent)] text-[var(--color-destructive)]",
            )}
          >
            {neutral ? (
              <Minus className="h-2.5 w-2.5" />
            ) : positive ? (
              <ArrowUpRight className="h-2.5 w-2.5" />
            ) : (
              <ArrowDownRight className="h-2.5 w-2.5" />
            )}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <span className="font-mono text-[28px] font-semibold leading-none tracking-tight tabular">
          {loading ? (
            <span className="inline-block h-6 w-24 rounded bg-muted animate-pulse" />
          ) : (
            value || "·"
          )}
        </span>
        {spark && spark.length > 1 && <Sparkline data={spark} positive={positive || neutral} />}
      </div>

      {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const w = 72;
  const h = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - ((v - min) / span) * h] as const);
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${d} L${w},${h} L0,${h} Z`;
  const stroke = positive ? "var(--color-success)" : "var(--color-destructive)";
  return (
    <svg width={w} height={h} className="overflow-visible" aria-hidden>
      <path d={area} fill={stroke} fillOpacity={0.08} />
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.25} strokeLinecap="round" />
    </svg>
  );
}
