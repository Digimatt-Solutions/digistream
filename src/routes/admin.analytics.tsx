import { createFileRoute } from "@tanstack/react-router";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi-card";
import { clientGrowth, viewsSeries, watchByType } from "@/lib/mock-data";
import { BarChart3, Eye, MonitorPlay, Users } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: Analytics,
});

function Analytics() {
  return (
    <>
      <PageHeader title="Analytics" description="Cross-tenant performance across content, devices and subscriptions." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total views" value="1.24M" delta={9} icon={Eye} tone="primary" />
        <KpiCard label="Watch hours" value="312,480" delta={12} icon={BarChart3} tone="info" />
        <KpiCard label="Active devices" value="8,412" delta={4} icon={MonitorPlay} tone="success" />
        <KpiCard label="New clients" value="24" delta={22} icon={Users} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold">Views trend</h3>
          <div className="mt-2 h-64">
            <ResponsiveContainer>
              <AreaChart data={viewsSeries}>
                <defs>
                  <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eee" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Area dataKey="views" stroke="#f97316" fill="url(#a1)" strokeWidth={2.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold">MRR growth</h3>
          <div className="mt-2 h-64">
            <ResponsiveContainer>
              <LineChart data={clientGrowth}>
                <CartesianGrid stroke="#eee" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Line dataKey="mrr" stroke="#0ea5e9" strokeWidth={2.4} dot={{ r: 3, fill: "#0ea5e9" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-5 shadow-[var(--shadow-card)] lg:col-span-2">
          <h3 className="font-semibold">Watch hours by content type</h3>
          <div className="mt-2 h-72">
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
