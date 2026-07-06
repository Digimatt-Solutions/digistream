import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Users, Film, Package, CreditCard, PlayCircle, Sparkles, Activity, TrendingUp } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { role } = useSession();
  return role === "admin" ? <AdminDashboard /> : <ClientDashboard />;
}

function KpiCard({ label, value, icon: Icon, tint = "primary" }: { label: string; value: string | number; icon: any; tint?: string }) {
  const tints: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    info: "bg-info/10 text-info",
    success: "bg-success/10 text-success",
    warning: "bg-warning/20 text-warning-foreground",
  };
  return (
    <Card className="rounded-2xl border-border p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-bold">{value}</div>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tints[tint]}`}>
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
        supabase.from("content").select("id, category", { count: "exact" }),
        supabase.from("packages").select("id, price_monthly", { count: "exact" }),
        supabase.from("subscriptions").select("id, package_id, packages(price_monthly)").eq("status", "active"),
        supabase.from("activity_logs").select("created_at").order("created_at", { ascending: false }).limit(30),
      ]);
      const mrr = (subs.data ?? []).reduce((s: number, r: any) => s + Number(r.packages?.price_monthly ?? 0), 0);
      const cats = new Map<string, number>();
      (content.data ?? []).forEach((c: any) => cats.set(c.category ?? "Other", (cats.get(c.category ?? "Other") ?? 0) + 1));
      return {
        userCount: users.count ?? 0,
        contentCount: content.count ?? 0,
        packageCount: packages.count ?? 0,
        activeSubs: subs.data?.length ?? 0,
        mrr,
        categories: Array.from(cats, ([name, value]) => ({ name, value })),
        recentActivity: logs.data?.length ?? 0,
      };
    },
  });

  const trend = Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],
    streams: Math.round(20 + Math.random() * 80),
  }));

  const COLORS = ["#f97316","#0ea5e9","#22c55e","#eab308","#a855f7"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Digistream platform overview</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Total Users" value={data?.userCount ?? "—"} icon={Users} />
        <KpiCard label="Content Items" value={data?.contentCount ?? "—"} icon={Film} tint="info" />
        <KpiCard label="Packages" value={data?.packageCount ?? "—"} icon={Package} tint="success" />
        <KpiCard label="Active Subscriptions" value={data?.activeSubs ?? "—"} icon={Sparkles} tint="warning" />
        <KpiCard label="MRR (USD)" value={`$${(data?.mrr ?? 0).toFixed(2)}`} icon={CreditCard} />
        <KpiCard label="Recent Activity" value={data?.recentActivity ?? 0} icon={Activity} tint="info" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Weekly stream activity</h3>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="streams" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-2xl p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold">Content categories</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.categories ?? []} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {(data?.categories ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(data?.categories ?? []).map((c, i) => (
              <span key={c.name} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {c.name}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ClientDashboard() {
  const { user } = useSession();
  const { data } = useQuery({
    queryKey: ["client-stats", user?.id],
    queryFn: async () => {
      const [sub, allowed] = await Promise.all([
        supabase.from("subscriptions").select("id, status, packages(name, max_streams, price_monthly)").eq("user_id", user!.id).eq("status", "active").maybeSingle(),
        supabase.from("content").select("id", { count: "exact", head: true }),
      ]);
      return { sub: sub.data as any, allowed: allowed.count ?? 0 };
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your streaming workspace</h1>
        <p className="text-sm text-muted-foreground">Play, brand and manage your subscription in one place.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard label="Current Plan" value={data?.sub?.packages?.name ?? "None"} icon={Sparkles} />
        <KpiCard label="Content Available" value={data?.allowed ?? 0} icon={Film} tint="info" />
        <KpiCard label="Max Concurrent" value={data?.sub?.packages?.max_streams ?? "—"} icon={PlayCircle} tint="success" />
      </div>
      <Card className="relative overflow-hidden rounded-2xl border-primary/20 p-8 shadow-[var(--shadow-elevated)]" style={{ background: "var(--gradient-primary)" }}>
        <div className="relative z-10 text-primary-foreground">
          <h2 className="text-2xl font-bold">Ready to stream?</h2>
          <p className="mt-1 max-w-md opacity-90">Open the player to watch content included with your active subscription.</p>
          <Button asChild size="lg" variant="secondary" className="mt-4 rounded-lg">
            <Link to="/app/watch"><PlayCircle className="mr-2 h-4 w-4" /> Open Player</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
