import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Props {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "info" | "success" | "warning";
}

const toneMap = {
  primary: "bg-[var(--primary-soft)] text-primary",
  info: "bg-blue-50 text-blue-600",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
};

export function KpiCard({ label, value, delta, hint, icon: Icon, tone = "primary" }: Props) {
  const up = (delta ?? 0) >= 0;
  return (
    <Card className="group relative overflow-hidden rounded-2xl border-border/70 bg-card p-5 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-elevated)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneMap[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {(delta !== undefined || hint) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {delta !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium ${
                up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}
            >
              {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(delta)}%
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </Card>
  );
}
