import type { ReactNode } from "react";
import { Feedback } from "./feedback";

interface Props {
  title: string;
  description: string;
  children: ReactNode;
  next?: { to: string; label: string };
  prev?: { to: string; label: string };
}

export function DocPageShell({ title, description, children, next, prev }: Props) {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>

      <div className="mt-8 space-y-6 leading-relaxed text-sm text-foreground/90">
        {children}
      </div>

      {(prev || next) && (
        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          {prev ? (
            <a href={prev.to} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <span aria-hidden>←</span> {prev.label}
            </a>
          ) : <div />}
          {next ? (
            <a href={next.to} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              {next.label} <span aria-hidden>→</span>
            </a>
          ) : <div />}
        </div>
      )}

      <Feedback />
    </div>
  );
}
