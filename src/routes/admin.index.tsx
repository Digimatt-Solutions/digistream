import { createFileRoute } from "@tanstack/react-router";
import {
  Film, Users, MonitorPlay, DollarSign, TrendingUp, HardDrive, Radio, Sparkles,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { KpiCard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { ACTIVITY, CLIENTS, CONTENT, DEVICES, clientGrowth, viewsSeries, watchByType } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/")({
  component: Overview,
});

const CHART_COLORS = ["#f97316", "#0ea5e9", "#10b981", "#eab308", "#8b5cf6", "#ec4899"];

function Overview() {
  const onlineDevices = DEVICES.filter((d) => d.status === "online").length;
  const topContent = [...CONTENT].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total content" value="128" delta={12} hint="vs last month" icon={Film} tone="primary" />
        <KpiCard label="Active clients" value={String(CLIENTS.filter(c => c.status === "active").length)} delta={8} hint="4 in trial" icon={Users} tone="info" />
        <KpiCard label="Devices online" value={`${onlineDevices}/${DEVICES.length}`} delta={3} hint="98.2% uptime" icon={MonitorPlay} tone="success" />
        <KpiCard label="Monthly recurring" value="$182,420" delta={14} hint="ARR $2.19M" icon={DollarSign} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl border-border bg-card p-5 shadow-[var(--shadow-card)] lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Views & streams</h3>
              <p className="text-xs text-muted-foreground">Rolling 14 days across all tenants</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Views</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-500" />Streams</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={viewsSeries} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eee" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Area type="monotone" dataKey="views" stroke="#f97316" strokeWidth={2.2} fill="url(#gV)" />
                <Area type="monotone" dataKey="streams" stroke="#0ea5e9" strokeWidth={2.2} fill="url(#gS)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold">Watch hours by type</h3>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
          <div className="mt-2 h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={watchByType} dataKey="hours" nameKey="type" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {watchByType.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
            {watchByType.map((w, i) => (
              <li key={w.type} className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                {w.type}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl border-border bg-card p-5 shadow-[var(--shadow-card)] lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Client growth & MRR</h3>
              <p className="text-xs text-muted-foreground">Trailing 8 months</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              <TrendingUp className="h-3 w-3" /> +18% QoQ
            </span>
          </div>
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={clientGrowth} margin={{ left: -10, right: 8, top: 8 }}>
                <CartesianGrid stroke="#eee" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Bar dataKey="clients" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Storage</h3>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-semibold">4.82<span className="text-lg text-muted-foreground"> / 8 TB</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full" style={{ width: "60%", background: "var(--gradient-primary)" }} />
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { l: "Video assets", v: "3.2 TB", c: "#f97316" },
              { l: "Audio", v: "820 GB", c: "#0ea5e9" },
              { l: "Thumbnails", v: "180 GB", c: "#10b981" },
              { l: "Backups", v: "620 GB", c: "#8b5cf6" },
            ].map((s) => (
              <li key={s.l} className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.c }} />{s.l}
                </span>
                <span className="font-medium">{s.v}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" size="sm" className="mt-4 w-full rounded-lg">Manage storage</Button>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl border-border bg-card p-5 shadow-[var(--shadow-card)] lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Top performing content</h3>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <ul className="divide-y divide-border">
            {topContent.map((c, i) => (
              <li key={c.id} className="flex items-center gap-3 py-3">
                <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white" style={{ background: c.thumbColor }}>
                  {c.type.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.type} · {c.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{c.views.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">views</div>
                </div>
                <span className="w-6 text-right text-xs font-medium text-muted-foreground">#{i + 1}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Recent activity</h3>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </div>
          <ul className="space-y-3">
            {ACTIVITY.map((a, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="leading-snug">
                    <span className="font-medium">{a.who}</span>{" "}
                    <span className="text-muted-foreground">{a.what}</span>{" "}
                    <span className="font-medium">{a.detail}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{a.when}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
