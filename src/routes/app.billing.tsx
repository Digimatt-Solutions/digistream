import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, CreditCard, Users, Wallet } from "lucide-react";
import { format } from "date-fns";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ksh } from "@/lib/currency";

export const Route = createFileRoute("/app/billing")({
  component: BillingPage,
});

const COLORS = ["#f97316", "#0ea5e9", "#22c55e", "#eab308", "#a855f7"];

function BillingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["billing"],
    queryFn: async () => {
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("*, profiles(full_name, email), packages(name, price_monthly)")
        .order("created_at", { ascending: false });
      const rows = subs ?? [];
      const active = rows.filter((s: any) => s.status === "active");
      const mrr = active.reduce(
        (s: number, r: any) => s + Number(r.packages?.price_monthly ?? 0),
        0,
      );
      const totalCollected = rows.reduce((s: number, r: any) => s + Number(r.amount_paid ?? 0), 0);

      // last 6 months revenue
      const months: { name: string; revenue: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        d.setDate(1);
        const name = d.toLocaleDateString(undefined, { month: "short" });
        const rev = rows
          .filter(
            (r: any) =>
              r.started_at &&
              new Date(r.started_at).getMonth() === d.getMonth() &&
              new Date(r.started_at).getFullYear() === d.getFullYear(),
          )
          .reduce(
            (s: number, r: any) => s + Number(r.amount_paid ?? r.packages?.price_monthly ?? 0),
            0,
          );
        months.push({ name, revenue: Math.round(rev) });
      }

      const byPlan = new Map<string, number>();
      active.forEach((s: any) => {
        const n = s.packages?.name ?? "-";
        byPlan.set(n, (byPlan.get(n) ?? 0) + Number(s.packages?.price_monthly ?? 0));
      });
      return {
        subs: rows,
        active,
        mrr,
        totalCollected,
        months,
        planShare: Array.from(byPlan, ([name, value]) => ({ name, value })),
      };
    },
  });

  const stats = useMemo(
    () => [
      {
        label: "MRR",
        value: ksh(data?.mrr ?? 0),
        icon: TrendingUp,
        tint: "text-success bg-success/10",
      },
      {
        label: "Total collected",
        value: ksh(data?.totalCollected ?? 0),
        icon: Wallet,
        tint: "text-primary bg-primary/10",
      },
      {
        label: "Active subs",
        value: data?.active.length ?? 0,
        icon: Users,
        tint: "text-info bg-info/10",
      },
      {
        label: "Total records",
        value: data?.subs.length ?? 0,
        icon: CreditCard,
        tint: "text-warning-foreground bg-warning/20",
      },
    ],
    [data],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">Revenue, subscriptions and payment history.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-2xl p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight">{s.value}</div>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.tint}`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl p-6 shadow-[var(--shadow-card)] lg:col-span-2">
          <h3 className="font-semibold">Revenue · last 6 months</h3>
          <div className="mt-4 h-64 -ml-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.months ?? []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}`} />
                <Tooltip
                  formatter={(v: any) => ksh(Number(v))}
                  contentStyle={{ borderRadius: 12 }}
                />
                <Bar dataKey="revenue" fill="#f97316" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="rounded-2xl p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold">MRR by plan</h3>
          <div className="mt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.planShare ?? []}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {(data?.planShare ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => ksh(Number(v))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-2xl p-0 shadow-[var(--shadow-card)]">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Receipt</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.subs ?? []).map((s: any) => (
                <TableRow key={s.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs">{s.receipt_id ?? "-"}</TableCell>
                  <TableCell className="font-medium">
                    {s.profiles?.full_name ?? s.profiles?.email}
                  </TableCell>
                  <TableCell>{s.packages?.name}</TableCell>
                  <TableCell className="font-semibold">
                    {ksh(Number(s.amount_paid ?? s.packages?.price_monthly ?? 0))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.status === "active" ? "default" : "secondary"}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {s.payment_method ?? "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right text-xs text-muted-foreground">
                    {format(new Date(s.started_at), "MMM d, yyyy · HH:mm")}
                  </TableCell>
                </TableRow>
              ))}
              {(data?.subs ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No subscriptions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
