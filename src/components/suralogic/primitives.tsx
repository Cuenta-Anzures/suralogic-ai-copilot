import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-2xl bg-card/60 p-4 ring-1 ring-border transition-shadow " + className
      }
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">{title}</h2>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function Delta({
  value,
  tone = "auto",
}: {
  value: number;
  tone?: "auto" | "neutral";
}) {
  const positive = value > 0;
  const negative = value < 0;
  const cls =
    tone === "neutral"
      ? "bg-accent text-muted-foreground"
      : positive
      ? "bg-primary/15 text-primary"
      : negative
      ? "bg-destructive/15 text-destructive"
      : "bg-accent text-muted-foreground";
  const Icon = positive ? ArrowUpRight : negative ? ArrowDownRight : Minus;
  return (
    <span
      className={
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold " +
        cls
      }
    >
      <Icon className="size-3" />
      {Math.abs(value)}%
    </span>
  );
}

export function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "success" | "warning" | "danger" | "neutral";
}) {
  const styles: Record<string, string> = {
    success: "bg-primary/15 text-primary ring-primary/25",
    warning: "bg-yellow-500/10 text-yellow-300 ring-yellow-500/25",
    danger: "bg-destructive/15 text-destructive ring-destructive/25",
    neutral: "bg-accent text-muted-foreground ring-border",
  };
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 " +
        styles[tone]
      }
    >
      {label}
    </span>
  );
}