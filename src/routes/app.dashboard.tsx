import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Film, Package, CreditCard, PlayCircle, Sparkles, Activity, TrendingUp, Music2, Video, Radio } from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend,
} from "recharts";
import { ksh } from "@/lib/currency";

export const Route = createFileRoute("/app/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { role } = useSession();
  return role === "admin" ? <AdminDashboard /> : <ClientDashboard />;
}

const COLORS = ["#f97316", "#0ea5e9", "#22c55e", "#eab308", "#a855f7", "#ef4444"];

function KpiCard({ label, value, icon: Icon, tint = "primary", sub }: { label: string; value: string | number; icon: any; tint?: string; sub?: string }) {
  const tints: Record<string, string> = {
    primary: "from-primary/15 to-primary/5 text-primary",
    info: "from-info/15 to-info/5 text-info",
    success: "from-success/15 to-success/5 text-success",
    warning: "from-warning/25 to-warning/5 text-warning-foreground",
  };
  return (
    <Card className="group relative overflow-hidden rounded-2xl border-border p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]">
      <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${tints[tint]} opacity-70 blur-2xl`} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
          {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${tints[tint]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [users, content, packages, subs, logs] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("content").select("id, category, content_type", { count: "exact" }),
        supabase.from("packages").select("id, price_monthly, name", { count: "exact" }),
        supabase.from("subscriptions").select("id, package_id, packages(name, price_monthly)").eq("status", "active"),
        supabase.from("activity_logs").select("created_at, action").order("created_at", { ascending: false }).limit(200),
      ]);
      const mrr = (subs.data ?? []).reduce((s: number, r: any) => s + Number(r.packages?.price_monthly ?? 0), 0);
      const cats = new Map<string, number>();
      (content.data ?? []).forEach((c: any) => cats.set(c.content_type ?? "video", (cats.get(c.content_type ?? "video") ?? 0) + 1));
      const planCounts = new Map<string, number>();
      (subs.data ?? []).forEach((s: any) => { const n = s.packages?.name ?? "-"; planCounts.set(n, (planCounts.get(n) ?? 0) + 1); });
      return {
        userCount: users.count ?? 0,
        contentCount: content.count ?? 0,
        packageCount: packages.count ?? 0,
        activeSubs: subs.data?.length ?? 0,
        mrr,
        categories: Array.from(cats, ([name, value]) => ({ name, value })),
        plans: Array.from(planCounts, ([name, subscribers]) => ({ name, subscribers })),
        recentActivity: logs.data?.length ?? 0,
        logs: logs.data ?? [],
      };
    },
  });

  const trend = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    return {
      day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      streams: Math.round(40 + Math.random() * 160),
      signups: Math.round(2 + Math.random() * 10),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Digistream platform overview at a glance.</p>
        </div>
        <div className="rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted-foreground">
          Updated {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
        <KpiCard label="Total Users" value={data?.userCount ?? "-"} icon={Users} />
        <KpiCard label="Content" value={data?.contentCount ?? "-"} icon={Film} tint="info" />
        <KpiCard label="Packages" value={data?.packageCount ?? "-"} icon={Package} tint="success" />
        <KpiCard label="Active Subs" value={data?.activeSubs ?? "-"} icon={Sparkles} tint="warning" />
        <KpiCard label="MRR" value={ksh(data?.mrr ?? 0)} icon={CreditCard} sub="Monthly recurring" />
        <KpiCard label="Activity" value={data?.recentActivity ?? 0} icon={Activity} tint="info" sub="Recent events" />
      </div>


      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl p-6 shadow-[var(--shadow-card)] lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Streams & signups · 14d</h3>
            </div>
            <div className="text-xs text-muted-foreground">Simulated trend</div>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="gStreams" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                <Legend />
                <Area type="monotone" dataKey="streams" stroke="#f97316" strokeWidth={2.5} fill="url(#gStreams)" />
                <Area type="monotone" dataKey="signups" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#gSignups)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-2xl p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold">Content mix</h3>
          <p className="text-xs text-muted-foreground">By content type</p>
          <div className="mt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.categories ?? []} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {(data?.categories ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(data?.categories ?? []).map((c, i) => (
              <span key={c.name} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium capitalize">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {c.name} <span className="text-muted-foreground">· {c.value}</span>
              </span>
            ))}
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Subscribers by plan</h3>
            <p className="text-xs text-muted-foreground">Distribution of active subscriptions</p>
          </div>
        </div>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.plans ?? []}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12 }} />
              <Bar dataKey="subscribers" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function ClientDashboard() {
  const { user } = useSession();
  const { data } = useQuery({
    queryKey: ["client-stats", user?.id],
    queryFn: async () => {
      const [sub, allContent, allowed] = await Promise.all([
        supabase.from("subscriptions").select("id, status, expires_at, started_at, packages(name, max_streams, price_monthly)").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("content").select("id, content_type", { count: "exact" }),
        supabase.from("content").select("id, title, thumbnail_url, content_type, category").eq("active", true).order("created_at", { ascending: false }).limit(6),
      ]);
      const typeCounts = new Map<string, number>();
      (allContent.data ?? []).forEach((c: any) => typeCounts.set(c.content_type ?? "video", (typeCounts.get(c.content_type ?? "video") ?? 0) + 1));
      return {
        sub: sub.data as any,
        totalContent: allContent.count ?? 0,
        recent: allowed.data ?? [],
        typeCounts: Array.from(typeCounts, ([name, value]) => ({ name, value })),
      };
    },
    enabled: !!user,
  });

  const activityTrend = Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],
    minutes: Math.round(30 + Math.random() * 120),
  }));

  const active = data?.sub?.status === "active";
  const expiresAt = data?.sub?.expires_at ? new Date(data.sub.expires_at) : null;
  const daysLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 86400000)) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your streaming workspace</h1>
        <p className="text-sm text-muted-foreground">Play, brand and manage your subscription in one place.</p>
      </div>

      {/* Hero */}
      <Card className="relative overflow-hidden rounded-3xl border-0 p-8 shadow-[var(--shadow-elevated)]" style={{ background: "var(--gradient-primary)" }}>
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-8 h-56 w-56 rounded-full bg-black/10 blur-3xl" />
        <div className="relative z-10 grid gap-6 text-primary-foreground md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> {active ? "Active plan" : "No active plan"}
            </div>
            <h2 className="mt-3 text-3xl font-bold">
              {data?.sub?.packages?.name ?? "Choose a plan"}
            </h2>
            <p className="mt-1 max-w-md opacity-95">
              {active ? "Open the player to stream what's included in your package." : "Subscribe to a plan to unlock streaming."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary" className="rounded-xl font-semibold">
                <Link to="/app/watch"><PlayCircle className="mr-2 h-4 w-4" /> Open Player</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white">
                <Link to="/app/subscription">Manage subscription</Link>
              </Button>
            </div>
          </div>
          {active && (
            <div className="rounded-2xl bg-white/15 p-5 backdrop-blur">
              <div className="text-xs uppercase tracking-widest opacity-80">Renews / expires</div>
              <div className="mt-1 text-2xl font-bold">{expiresAt ? expiresAt.toLocaleDateString() : "-"}</div>
              {daysLeft !== null && <div className="mt-1 text-sm opacity-90">{daysLeft} days remaining</div>}
              <div className="mt-3 text-xs opacity-80">
                {ksh(Number(data?.sub?.packages?.price_monthly ?? 0))} / mo · up to {data?.sub?.packages?.max_streams ?? "-"} streams
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <KpiCard label="Content Available" value={data?.totalContent ?? 0} icon={Film} />
        <KpiCard label="Videos" value={data?.typeCounts?.find(t => t.name === "video")?.value ?? 0} icon={Video} tint="info" />
        <KpiCard label="Songs" value={data?.typeCounts?.find(t => t.name === "song")?.value ?? 0} icon={Music2} tint="success" />
        <KpiCard label="Mixes" value={data?.typeCounts?.find(t => t.name === "mix")?.value ?? 0} icon={Radio} tint="warning" />
      </div>


      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl p-6 shadow-[var(--shadow-card)] lg:col-span-2">
          <h3 className="font-semibold">Watch time · this week</h3>
          <p className="text-xs text-muted-foreground">Minutes streamed per day</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityTrend}>
                <defs>
                  <linearGradient id="gWatch" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
                <Area type="monotone" dataKey="minutes" stroke="#f97316" strokeWidth={2.5} fill="url(#gWatch)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-2xl p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold">Library breakdown</h3>
          <div className="mt-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.typeCounts ?? []} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {(data?.typeCounts ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent */}
      <Card className="rounded-2xl p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Recently added</h3>
          <Link to="/app/watch" className="text-xs font-semibold text-primary hover:underline">Browse all →</Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {(data?.recent ?? []).map((c: any) => (
            <Link key={c.id} to="/app/watch" className="group overflow-hidden rounded-xl border border-border transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="aspect-video bg-secondary">
                {c.thumbnail_url ? <img src={c.thumbnail_url} className="h-full w-full object-cover" alt="" /> : <div className="flex h-full w-full items-center justify-center"><Film className="h-6 w-6 text-muted-foreground" /></div>}
              </div>
              <div className="p-2">
                <div className="truncate text-xs font-semibold">{c.title}</div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{c.content_type}</div>
              </div>
            </Link>
          ))}
          {(data?.recent ?? []).length === 0 && (
            <div className="col-span-full py-6 text-center text-sm text-muted-foreground">No content yet.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
