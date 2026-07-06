import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  online: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  Published: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  offline: "bg-red-50 text-red-700 ring-red-600/10",
  suspended: "bg-red-50 text-red-700 ring-red-600/10",
  Archived: "bg-zinc-100 text-zinc-700 ring-zinc-500/10",
  syncing: "bg-blue-50 text-blue-700 ring-blue-600/10",
  Scheduled: "bg-blue-50 text-blue-700 ring-blue-600/10",
  trialing: "bg-amber-50 text-amber-700 ring-amber-600/10",
  Draft: "bg-amber-50 text-amber-700 ring-amber-600/10",
  Premium: "bg-[var(--primary-soft)] text-[color:var(--primary)] ring-[color:var(--primary)]/10",
  Standard: "bg-blue-50 text-blue-700 ring-blue-600/10",
  Basic: "bg-zinc-100 text-zinc-700 ring-zinc-500/10",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const dot = ["online", "active", "Published"].includes(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize",
        map[status] ?? "bg-zinc-100 text-zinc-700 ring-zinc-500/10",
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {status}
    </span>
  );
}
