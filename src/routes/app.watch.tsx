import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PlayCircle, Film, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/watch")({
  component: WatchPage,
});

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
    queryFn: async () => (await supabase.from("subscriptions").select("*, packages(name)").eq("user_id", user!.id).eq("status", "active").maybeSingle()).data,
    enabled: !!user,
  });

  const [selected, setSelected] = useState<any | null>(null);
  useEffect(() => {
    if (!selected && content && content.length > 0) setSelected(content[0]);
  }, [content, selected]);

  const brandColor = brand?.primary_color || "#f97316";

  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;

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
        <p className="mt-2 text-sm text-muted-foreground">Your subscription is active but the admin hasn't attached content to this package.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Client-branded header */}
      <div className="overflow-hidden rounded-2xl p-6 shadow-[var(--shadow-elevated)]" style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}c0)` }}>
        <div className="flex items-center justify-between gap-4 text-white">
          <div className="flex items-center gap-3">
            {brand?.logo_url ? <img src={brand.logo_url} alt="" className="h-10 w-auto" /> : <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20"><PlayCircle className="h-5 w-5" /></div>}
            <div>
              <div className="text-lg font-bold">{brand?.brand_name || "Your Streaming Player"}</div>
              <div className="text-sm opacity-90">{brand?.tagline || `${sub.packages?.name} plan`}</div>
            </div>
          </div>
          <Button asChild variant="secondary" size="sm"><Link to="/app/branding">Customize</Link></Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Player */}
        <div>
          <Card className="overflow-hidden rounded-2xl shadow-[var(--shadow-elevated)]">
            <div className="aspect-video bg-black">
              {selected && (
                <video key={selected.id} controls className="h-full w-full" poster={selected.thumbnail_url}>
                  <source src={selected.stream_url} type="video/mp4" />
                </video>
              )}
            </div>
            {selected && (
              <div className="p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{selected.category}</div>
                <h2 className="mt-1 text-xl font-bold">{selected.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{selected.description}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Library */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Your library</h3>
          <div className="space-y-2">
            {content.map((c: any) => {
              const isActive = selected?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${isActive ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"}`}
                >
                  <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
                    {c.thumbnail_url ? <img src={c.thumbnail_url} alt="" className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{c.title}</div>
                    <div className="text-xs text-muted-foreground">{c.category}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
