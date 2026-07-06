import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/app/billing")({
  component: BillingPage,
});

function BillingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["billing"],
    queryFn: async () => {
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("*, profiles(full_name, email), packages(name, price_monthly)")
        .order("created_at", { ascending: false });
      const total = (subs ?? []).filter((s: any) => s.status === "active")
        .reduce((s: number, r: any) => s + Number(r.packages?.price_monthly ?? 0), 0);
      return { subs: subs ?? [], mrr: total };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground">Active subscriptions and monthly recurring revenue.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl p-5 shadow-[var(--shadow-card)]">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Active MRR</div>
          <div className="mt-2 text-3xl font-bold">${(data?.mrr ?? 0).toFixed(2)}</div>
        </Card>
        <Card className="rounded-2xl p-5 shadow-[var(--shadow-card)]">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Active Subscriptions</div>
          <div className="mt-2 text-3xl font-bold">{(data?.subs ?? []).filter((s: any) => s.status === "active").length}</div>
        </Card>
        <Card className="rounded-2xl p-5 shadow-[var(--shadow-card)]">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Total Records</div>
          <div className="mt-2 text-3xl font-bold">{(data?.subs ?? []).length}</div>
        </Card>
      </div>
      <Card className="rounded-2xl p-0 shadow-[var(--shadow-card)]">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.subs ?? []).map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.profiles?.full_name ?? s.profiles?.email}</TableCell>
                  <TableCell>{s.packages?.name}</TableCell>
                  <TableCell>${Number(s.packages?.price_monthly ?? 0).toFixed(2)}/mo</TableCell>
                  <TableCell><Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(s.started_at), "MMM d, yyyy")}</TableCell>
                </TableRow>
              ))}
              {(data?.subs ?? []).length === 0 && (
                <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No subscriptions yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
