import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PlayCircle, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CONTENT, type ContentType } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/client/catalogue")({
  component: Catalogue,
});

const TYPES: (ContentType | "All")[] = ["All", "Movie", "TV Show", "Audio", "DJ Mix", "Podcast", "Live Stream", "Promo"];

function Catalogue() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<ContentType | "All">("All");
  const rows = useMemo(() => CONTENT.filter((c) => c.status === "Published" &&
    (type === "All" || c.type === type) && c.title.toLowerCase().includes(q.toLowerCase())), [q, type]);

  return (
    <>
      <PageHeader title="Content Catalogue" description="Browse content licensed under your subscription." />
      <Card className="rounded-2xl border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search catalogue…" className="h-9 rounded-lg border-border bg-secondary pl-9" />
          </div>
          <Select value={type} onValueChange={(v) => setType(v as any)}>
            <SelectTrigger className="h-9 w-[140px] rounded-lg"><SelectValue /></SelectTrigger>
            <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {rows.map((c) => (
            <div key={c.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl text-white shadow-[var(--shadow-card)] transition group-hover:shadow-[var(--shadow-elevated)]" style={{ background: `linear-gradient(160deg, ${c.thumbColor}, oklch(0.35 0.05 40))` }}>
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <div className="text-[10px] uppercase tracking-wider opacity-80">{c.type} · {c.duration}</div>
                  <div className="mt-0.5 text-sm font-semibold leading-tight">{c.title}</div>
                </div>
                <PlayCircle className="absolute right-2 top-2 h-5 w-5 opacity-70 transition group-hover:opacity-100" />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{c.category}</span>
                <span>{c.views.toLocaleString()} views</span>
              </div>
            </div>
          ))}
          {rows.length === 0 && <div className="col-span-full py-12 text-center text-sm text-muted-foreground">No matching content.</div>}
        </div>
      </Card>
    </>
  );
}
