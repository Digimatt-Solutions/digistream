import { PlayCircle } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
        style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
      >
        <PlayCircle className="h-5 w-5" strokeWidth={2.25} />
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-tight">Digimatt</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Streaming Platform</div>
        </div>
      )}
    </div>
  );
}
