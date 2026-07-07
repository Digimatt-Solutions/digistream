import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, PlayCircle, Film, Lock, Search, Music2, Video, Radio, Mic2, Play, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/app/watch")({
  component: WatchPage,
});

const TYPE_META: Record<string, { label: string; icon: any }> = {
  video: { label: "Videos", icon: Video },
  song: { label: "Songs", icon: Music2 },
  mix: { label: "Mixes", icon: Radio },
  podcast: { label: "Podcasts", icon: Mic2 },
  live: { label: "Live", icon: PlayCircle },
};

function WatchPage() {
  const { user } = useSession();
  const { data: content, isLoading } = useQuery({
    queryKey: ["watchable", user?.id],
    queryFn: async () => (await supabase.from("content").select("*").eq("active", true).order("created_at", { ascending: false })).data ?? [],
    enabled: !!user,
  });
  const { data: brand } = useQuery({
    queryKey: ["brand", user?.id],
    queryFn: async () => (await supabase.from("client_brands").select("*").eq("user_id", user!.id).maybeSingle()).data,
    enabled: !!user,
  });
  const { data: sub } = useQuery({
    queryKey: ["my-sub", user?.id],
    queryFn: async () => (await supabase.from("subscriptions").select("*, packages(name)").eq("user_id", user!.id).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle()).data,
    enabled: !!user,
  });

  const [selected, setSelected] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!content) return [];
    if (!search) return content;
    const s = search.toLowerCase();
    return content.filter((c: any) => `${c.title} ${c.artist ?? ""} ${c.category ?? ""}`.toLowerCase().includes(s));
  }, [content, search]);
  const TYPE_ORDER = ["mix", "song", "video", "podcast", "live"] as const;
  const grouped = useMemo(() => {
    const g: Record<string, any[]> = {};
    filtered.forEach((c: any) => { (g[c.content_type ?? "video"] ||= []).push(c); });
    // return in fixed order: mixes first, then songs, then videos
    const ordered: [string, any[]][] = [];
    TYPE_ORDER.forEach((t) => { if (g[t]?.length) ordered.push([t, g[t]]); });
    Object.keys(g).forEach((k) => { if (!TYPE_ORDER.includes(k as never)) ordered.push([k, g[k]]); });
    return ordered;
  }, [filtered]);

  const brandColor = brand?.primary_color || "#f97316";

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  if (!sub) {
    return (
      <Card className="mx-auto max-w-lg rounded-2xl p-8 text-center shadow-[var(--shadow-card)]">
        <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
        <h2 className="mt-3 text-xl font-bold">No active subscription</h2>
        <p className="mt-2 text-sm text-muted-foreground">Subscribe to a package to unlock streaming content.</p>
        <Button asChild className="mt-4"><Link to="/app/subscription">View plans</Link></Button>
      </Card>
    );
  }

  if (!content || content.length === 0) {
    return (
      <Card className="mx-auto max-w-lg rounded-2xl p-8 text-center shadow-[var(--shadow-card)]">
        <Film className="mx-auto h-8 w-8 text-muted-foreground" />
        <h2 className="mt-3 text-xl font-bold">No content in your plan yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">Your subscription is active but no content has been added.</p>
      </Card>
    );
  }

  const hero = filtered[0];

  return (
    <div className="space-y-8">
      {/* Netflix-style hero */}
      {hero && !selected && (
        <div className="relative overflow-hidden rounded-3xl shadow-[var(--shadow-elevated)]">
          <div className="aspect-[21/9] w-full bg-black">
            {hero.thumbnail_url && (
              <img src={hero.thumbnail_url} alt="" className="h-full w-full object-cover opacity-70" />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 flex items-end p-8 md:p-12">
            <div className="max-w-xl text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur">
                <span style={{ background: brandColor }} className="h-2 w-2 rounded-full" />
                Featured · {(TYPE_META[hero.content_type ?? "video"] ?? TYPE_META.video).label}
              </div>
              <h1 className="mt-3 text-3xl font-bold md:text-5xl">{hero.title}</h1>
              <p className="mt-2 line-clamp-2 text-sm text-white/85 md:text-base">{hero.description}</p>
              <div className="mt-4 flex gap-2">
                <Button size="lg" onClick={() => setSelected(hero)} style={{ background: brandColor }} className="rounded-xl font-semibold text-white hover:opacity-90">
                  <Play className="mr-2 h-4 w-4 fill-current" /> Play now
                </Button>
                <Button size="lg" variant="outline" className="rounded-xl border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white" onClick={() => setSelected(hero)}>
                  More info
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Player when selected */}
      {selected && (
        <Card className="overflow-hidden rounded-2xl bg-black shadow-[var(--shadow-elevated)]">
          <div className="aspect-video bg-black">
            <video key={selected.id} controls autoPlay className="h-full w-full" poster={selected.thumbnail_url}>
              <source src={selected.stream_url} type="video/mp4" />
            </video>
          </div>
          <div className="p-5 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-white/60">{selected.content_type} · {selected.category}</div>
                <h2 className="mt-1 text-2xl font-bold">{selected.title}</h2>
                {selected.artist && <div className="text-sm text-white/80">by {selected.artist}</div>}
                <p className="mt-2 max-w-2xl text-sm text-white/70">{selected.description}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Search */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Browse library</h2>
          <p className="text-xs text-muted-foreground">{filtered.length} items available on your <b>{sub.packages?.name}</b> plan</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, artist…" className="w-64 pl-9" />
        </div>
      </div>

      {/* Rows by type: mixes, songs, videos */}
      {grouped.map(([type, items]) => (
        <Row key={type} type={type} items={items} onPlay={setSelected} brandColor={brandColor} selectedId={selected?.id} />
      ))}
    </div>
  );
}

function Row({ type, items, onPlay, brandColor, selectedId }: { type: string; items: any[]; onPlay: (c: any) => void; brandColor: string; selectedId?: string }) {
  const meta = TYPE_META[type] ?? TYPE_META.video;
  const scroller = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <meta.icon className="h-4 w-4" style={{ color: brandColor }} />
        <h3 className="text-lg font-bold">{meta.label}</h3>
        <span className="text-xs text-muted-foreground">· {items.length}</span>
        <div className="ml-auto flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => scroll(-1)}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => scroll(1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <div ref={scroller} className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {items.map((c) => (
          <button
            key={c.id}
            onClick={() => onPlay(c)}
            className={`group relative w-64 shrink-0 overflow-hidden rounded-xl border transition hover:-translate-y-1 hover:shadow-xl ${selectedId === c.id ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
          >
            <div className="aspect-video bg-secondary">
              {c.thumbnail_url ? (
                <img src={c.thumbnail_url} className="h-full w-full object-cover transition group-hover:scale-105" alt="" />
              ) : (
                <div className="flex h-full items-center justify-center"><Film className="h-8 w-8 text-muted-foreground" /></div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3 text-left text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: brandColor }}><Play className="h-4 w-4 fill-current" /></div>
                <span className="text-xs font-semibold uppercase tracking-widest">Play</span>
              </div>
            </div>
            <div className="p-3 text-left">
              <div className="truncate text-sm font-semibold">{c.title}</div>
              <div className="text-[11px] text-muted-foreground">{c.artist ? `${c.artist} · ` : ""}{c.category}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
