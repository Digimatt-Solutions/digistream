import { createFileRoute } from "@tanstack/react-router";
import { Check, Star } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/packages")({
  component: Packages,
});

function Packages() {
  return (
    <>
      <PageHeader title="Subscription Packages" description="Configure plans that gate content, devices and API access." />
      <div className="grid gap-5 md:grid-cols-3">
        {PLANS.map((p, i) => {
          const featured = p.name === "Standard";
          return (
            <Card key={p.name} className={cn(
              "relative rounded-2xl border-border bg-card p-6 shadow-[var(--shadow-card)]",
              featured && "ring-2 ring-primary"
            )}>
              {featured && (
                <span className="absolute -top-2.5 left-6 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                  <Star className="h-3 w-3" /> Most popular
                </span>
              )}
              <div className="text-sm font-medium text-muted-foreground">{p.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">${p.price}</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{p.devices} devices · {p.apiCalls} API calls</p>
              <ul className="mt-5 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant={featured ? "default" : "outline"} className="mt-6 w-full rounded-lg">Edit plan</Button>
            </Card>
          );
        })}
      </div>
    </>
  );
}
