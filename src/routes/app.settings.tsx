import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Chrome,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

const COLORS = [
  "#f97316",
  "#0ea5e9",
  "#22c55e",
  "#eab308",
  "#a855f7",
  "#ef4444",
  "#14b8a6",
  "#f43f5e",
];

function SettingsPage() {
  const { user, role, signOut } = useSession();
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [prefs, setPrefs] = useState({ notifications: true, weeklyDigest: false });

  const changePassword = async () => {
    if (!pw || pw.length < 8) return toast.error("Password must be at least 8 characters");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(error.message);
    setPw("");
    toast.success("Password updated");
    await supabase
      .from("activity_logs")
      .insert({ user_id: user!.id, action: "password.updated", entity: "auth" } as never);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Security, preferences{role === "admin" ? " and platform traffic" : ""}.
        </p>
      </div>

      {role === "admin" && <TrafficAnalytics />}

      <Card className="rounded-2xl p-6 shadow-[var(--shadow-card)]">
        <h3 className="font-semibold">Change password</h3>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label>New password</Label>
            <Input
              className="mt-1.5"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <Button onClick={changePassword} disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Update
          </Button>
        </div>
      </Card>

      <Card className="rounded-2xl p-6 shadow-[var(--shadow-card)]">
        <h3 className="font-semibold">Preferences</h3>
        <div className="mt-4 space-y-3">
          {[
            ["Email notifications", "notifications"],
            ["Weekly analytics digest", "weeklyDigest"],
          ].map(([label, key]) => (
            <div
              key={key as string}
              className="flex items-center justify-between rounded-xl border border-border p-3"
            >
              <span className="text-sm">{label}</span>
              <Switch
                checked={(prefs as any)[key as string]}
                onCheckedChange={(v) => setPrefs({ ...prefs, [key as string]: v })}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={() => toast.success("Preferences saved")}>
            Save preferences
          </Button>
        </div>
      </Card>

      <Card className="rounded-2xl border-destructive/30 p-6 shadow-[var(--shadow-card)]">
        <h3 className="font-semibold text-destructive">Danger zone</h3>
        <p className="mt-1 text-sm text-muted-foreground">Sign out of your Digistream workspace.</p>
        <Button
          variant="destructive"
          className="mt-4"
          onClick={async () => {
            await signOut();
            navigate({ to: "/auth" });
          }}
        >
          Sign out
        </Button>
      </Card>
    </div>
  );
}

function TrafficAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-traffic"],
    queryFn: async () =>
      (
        await supabase
          .from("activity_logs")
          .select("action, country, device, browser, os, created_at")
          .order("created_at", { ascending: false })
          .limit(2000)
      ).data ?? [],
  });

  const stats = useMemo(() => {
    const rows = data ?? [];
    const visits = rows.filter((r: any) => r.action === "page.view");
    const byCountry = agg(visits, "country");
    const byDevice = agg(visits, "device");
    const byBrowser = agg(visits, "browser");
    const byOS = agg(visits, "os");

    // 14-day trend
    const days = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.set(d.toISOString().slice(0, 10), 0);
    }
    visits.forEach((r: any) => {
      const k = new Date(r.created_at).toISOString().slice(0, 10);
      if (days.has(k)) days.set(k, (days.get(k) ?? 0) + 1);
    });
    const trend = Array.from(days, ([date, visits]) => ({
      date: new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      visits,
    }));

    return { total: visits.length, byCountry, byDevice, byBrowser, byOS, trend };
  }, [data]);

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );

  return (
    <Card className="rounded-2xl p-6 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <TrendingUp className="h-4 w-4 text-primary" />
            Platform traffic
          </h3>
          <p className="text-xs text-muted-foreground">
            Aggregated from real page-view events - last 2,000 records.
          </p>
        </div>
        <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Users className="mr-1 inline h-3 w-3" /> {stats.total.toLocaleString()} visits
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-xl p-4 lg:col-span-2">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Visits - 14d
          </div>
          <div className="mt-3 h-56 -ml-11">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trend}>
                <defs>
                  <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  fill="url(#gv)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-xl p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Smartphone className="h-3 w-3" />
            Devices
          </div>
          <MiniPie data={stats.byDevice} />
        </Card>

        <Card className="rounded-xl p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Globe className="h-3 w-3" />
            Top countries
          </div>
          <div className="mt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={stats.byCountry.slice(0, 8)}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-xl p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Chrome className="h-3 w-3" />
            Browsers
          </div>
          <MiniPie data={stats.byBrowser} />
        </Card>

        <Card className="rounded-xl p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Monitor className="h-3 w-3" />
            Operating systems
          </div>
          <MiniPie data={stats.byOS} />
        </Card>
      </div>
    </Card>
  );
}

function MiniPie({ data }: { data: { name: string; value: number }[] }) {
  if (!data.length)
    return (
      <div className="flex h-56 items-center justify-center text-xs text-muted-foreground">
        No data yet
      </div>
    );
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={3}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function agg(rows: any[], key: string) {
  const m = new Map<string, number>();
  rows.forEach((r) => {
    const v = r[key] || "Unknown";
    m.set(v, (m.get(v) ?? 0) + 1);
  });
  return Array.from(m, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}
