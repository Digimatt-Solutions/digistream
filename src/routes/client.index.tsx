import { createFileRoute } from "@tanstack/react-router";
import { Film, MonitorPlay, PlayCircle, Users } from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { KpiCard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/lib/auth";
import { CLIENTS, CONTENT, DEVICES, PLAYLISTS, viewsSeries } from "@/lib/mock-data";

export const Route = createFileRoute("/client/")({
  component: ClientOverview,
});

function ClientOverview() {
  const { user } = useAuth();
  const clientId = user?.clientId ?? "c1";
  const client = CLIENTS.find(c => c.id === clientId) ?? CLIENTS[0];
  const myDevices = DEVICES.filter(d => d.clientId === clientId);
  const myPlaylists = PLAYLISTS.filter(p => p.clientId === clientId);
  const online = myDevices.filter(d => d.status === "online").length;
  const featured = CONTENT.filter(c => c.status === "Published").slice(0, 6);

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden rounded-2xl border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="absolute inset-0 -z-10 opacity-10" style={{ background: "var(--gradient-primary)" }} />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Workspace</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">{client.name}</h2>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge status={client.plan} />
              <StatusBadge status={client.status} />
              <span className="text-xs text-muted-foreground">Since {client.since}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-lg">Manage devices</Button>
            <Button className="rounded-lg">Create playlist</Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Licensed content" value="86" delta={4} icon={Film} tone="primary" hint="within your plan" />
        <KpiCard label="Active playlists" value={String(myPlaylists.length)} icon={PlayCircle} tone="info" />
        <KpiCard label="Devices online" value={`${online}/${myDevices.length}`} delta={2} icon={MonitorPlay} tone="success" />
        <KpiCard label="Team members" value={String(client.users)} icon={Users} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl border-border bg-card p-5 shadow-[var(--shadow-card)] lg:col-span-2">
          <h3 className="font-semibold">Streams over the last 14 days</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer>
              <AreaChart data={viewsSeries}>
                <defs>
                  <linearGradient id="cs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eee" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Area dataKey="streams" stroke="#f97316" fill="url(#cs)" strokeWidth={2.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold">Your playlists</h3>
          <ul className="mt-3 space-y-3">
            {myPlaylists.length ? myPlaylists.map((p) => (
              <li key={p.id} className="rounded-xl border border-border bg-secondary/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.duration}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{p.items} items · {p.devices} devices</div>
              </li>
            )) : <li className="text-sm text-muted-foreground">No playlists yet. Create one to get started.</li>}
          </ul>
        </Card>
      </div>

      <Card className="rounded-2xl border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Featured in your catalogue</h3>
          <Button variant="ghost" size="sm">Browse all</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {featured.map((c) => (
            <div key={c.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl text-white shadow-[var(--shadow-card)] transition group-hover:shadow-[var(--shadow-elevated)]" style={{ background: `linear-gradient(160deg, ${c.thumbColor}, oklch(0.4 0.05 40))` }}>
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <div className="text-[10px] uppercase tracking-wider opacity-80">{c.type}</div>
                  <div className="mt-0.5 text-sm font-semibold leading-tight">{c.title}</div>
                </div>
                <PlayCircle className="absolute right-2 top-2 h-5 w-5 opacity-70 transition group-hover:opacity-100" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
