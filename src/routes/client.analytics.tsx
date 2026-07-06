import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi-card";
import { Eye, MonitorPlay, PlayCircle, Users } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { viewsSeries, watchByType } from "@/lib/mock-data";

export const Route = createFileRoute("/client/analytics")({
  component: ClientAnalytics,
});

function ClientAnalytics() {
  return (
    <>
      <PageHeader title="Workspace Analytics" description="Streaming performance across your devices and playlists." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Streams" value="48,210" delta={11} icon={PlayCircle} tone="primary" />
        <KpiCard label="Unique viewers" value="12,904" delta={7} icon={Eye} tone="info" />
        <KpiCard label="Watch hours" value="4,820" delta={9} icon={MonitorPlay} tone="success" />
        <KpiCard label="Team activity" value="128" delta={-3} icon={Users} tone="warning" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold">Streams over time</h3>
          <div className="mt-2 h-64">
            <ResponsiveContainer>
              <AreaChart data={viewsSeries}>
                <defs><linearGradient id="ca" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" stopOpacity={0.35} /><stop offset="100%" stopColor="#f97316" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="#eee" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Area dataKey="streams" stroke="#f97316" fill="url(#ca)" strokeWidth={2.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="rounded-2xl border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold">Watch hours by type</h3>
          <div className="mt-2 h-64">
            <ResponsiveContainer>
              <BarChart data={watchByType}>
                <CartesianGrid stroke="#eee" vertical={false} />
                <XAxis dataKey="type" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Bar dataKey="hours" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  );
}
