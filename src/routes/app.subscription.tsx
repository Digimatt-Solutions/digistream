import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/subscription")({
  component: SubscriptionPage,
});

function SubscriptionPage() {
  const { user } = useSession();
  const qc = useQueryClient();
  const { data: packages } = useQuery({
    queryKey: ["packages-public"],
    queryFn: async () => (await supabase.from("packages").select("*").eq("active", true).order("price_monthly")).data ?? [],
  });
  const { data: mine } = useQuery({
    queryKey: ["my-sub", user?.id],
    queryFn: async () => (await supabase.from("subscriptions").select("*").eq("user_id", user!.id).eq("status", "active").maybeSingle()).data,
    enabled: !!user,
  });
  const { data: counts } = useQuery({
    queryKey: ["pkg-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("package_content").select("package_id");
      const map = new Map<string, number>();
      (data ?? []).forEach((r) => map.set(r.package_id, (map.get(r.package_id) ?? 0) + 1));
      return map;
    },
  });

  const subscribe = async (pkgId: string) => {
    if (mine) {
      await supabase.from("subscriptions").update({ status: "cancelled" }).eq("id", mine.id);
    }
    const { error } = await supabase.from("subscriptions").insert({ user_id: user!.id, package_id: pkgId, status: "active" });
    if (error) return toast.error(error.message);
    toast.success("Subscription updated");
    qc.invalidateQueries();
    await supabase.from("activity_logs").insert({ user_id: user!.id, action: "subscription.changed", entity: pkgId });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription</h1>
        <p className="text-sm text-muted-foreground">Choose a plan to unlock content in your player.</p>
      </div>
      {!packages ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {packages.map((p: any) => {
            const active = mine?.package_id === p.id;
            return (
              <Card key={p.id} className={`relative rounded-2xl p-6 shadow-[var(--shadow-card)] ${active ? "border-primary ring-2 ring-primary/20" : ""}`}>
                {active && <Badge className="absolute right-4 top-4">Current</Badge>}
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles className="h-5 w-5" /></div>
                <h3 className="mt-4 text-xl font-bold">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-4 text-4xl font-bold">${Number(p.price_monthly).toFixed(0)}<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> {counts?.get(p.id) ?? 0} content items</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Up to {p.max_streams} concurrent streams</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Custom branding included</li>
                </ul>
                <Button className="mt-6 w-full" disabled={active} onClick={() => subscribe(p.id)}>
                  {active ? "Active plan" : "Subscribe"}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
      {mine && (
        <div className="text-center">
          <Link to="/app/watch" className="text-sm text-primary hover:underline">Open your player →</Link>
        </div>
      )}
    </div>
  );
}
