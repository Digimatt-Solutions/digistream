import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { CLIENTS, PLANS } from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/client/subscription")({
  component: Subscription,
});

function Subscription() {
  const { user } = useAuth();
  const clientId = user?.clientId ?? "c1";
  const client = CLIENTS.find(c => c.id === clientId) ?? CLIENTS[0];
  return (
    <>
      <PageHeader title="Subscription" description="Your current plan, usage, and upgrade options." />
      <Card className="mb-6 rounded-2xl border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Current plan</div>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-2xl font-semibold">{client.plan}</span>
              <StatusBadge status={client.status} />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">${client.mrr.toLocaleString()}/mo · Renews Aug 12, 2026</div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-lg">Manage payment</Button>
            <Button className="rounded-lg">Upgrade plan</Button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-secondary/40 p-4">
            <div className="text-xs text-muted-foreground">Devices</div>
            <div className="mt-1 text-lg font-semibold">{client.devices} / 500</div>
            <div className="mt-2 h-1.5 rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${(client.devices/500)*100}%` }} /></div>
          </div>
          <div className="rounded-xl bg-secondary/40 p-4">
            <div className="text-xs text-muted-foreground">API calls</div>
            <div className="mt-1 text-lg font-semibold">142K / Unlimited</div>
            <div className="mt-2 h-1.5 rounded-full bg-secondary"><div className="h-full w-1/3 rounded-full bg-primary" /></div>
          </div>
          <div className="rounded-xl bg-secondary/40 p-4">
            <div className="text-xs text-muted-foreground">Storage</div>
            <div className="mt-1 text-lg font-semibold">128 / 500 GB</div>
            <div className="mt-2 h-1.5 rounded-full bg-secondary"><div className="h-full w-1/4 rounded-full bg-primary" /></div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => {
          const current = p.name === client.plan;
          return (
            <Card key={p.name} className={cn("rounded-2xl border-border p-6 shadow-[var(--shadow-card)]", current && "ring-2 ring-primary")}>
              <div className="text-sm font-medium text-muted-foreground">{p.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight">${p.price}</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <ul className="mt-4 space-y-1.5 text-sm">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary" />{f}</li>
                ))}
              </ul>
              <Button variant={current ? "outline" : "default"} className="mt-5 w-full rounded-lg" disabled={current}>
                {current ? "Current plan" : `Switch to ${p.name}`}
              </Button>
            </Card>
          );
        })}
      </div>
    </>
  );
}
