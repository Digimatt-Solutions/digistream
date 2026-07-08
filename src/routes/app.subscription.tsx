import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Check,
  Loader2,
  Sparkles,
  Zap,
  Crown,
  CreditCard,
  ShieldCheck,
  Download,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { ksh } from "@/lib/currency";
import { logAction } from "@/lib/activity";
import { format } from "date-fns";
import { createStripeCheckout, confirmStripeCheckout } from "@/lib/stripe.functions";

export const Route = createFileRoute("/app/subscription")({
  component: SubscriptionPage,
  validateSearch: (s: Record<string, unknown>) => ({
    stripe: (s.stripe as string) || undefined,
    pkg: (s.pkg as string) || undefined,
    sid: (s.sid as string) || undefined,
  }),
});

const ICONS = [Zap, Sparkles, Crown];

function SubscriptionPage() {
  const { user } = useSession();
  const qc = useQueryClient();

  const { data: packages } = useQuery({
    queryKey: ["packages-public"],
    queryFn: async () =>
      (await supabase.from("packages").select("*").eq("active", true).order("price_monthly"))
        .data ?? [],
  });
  const { data: mine } = useQuery({
    queryKey: ["my-sub", user?.id],
    queryFn: async () =>
      (
        await supabase
          .from("subscriptions")
          .select("*, packages(name, price_monthly)")
          .eq("user_id", user!.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      ).data,
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
  const { data: history } = useQuery({
    queryKey: ["sub-history", user?.id],
    queryFn: async () =>
      (
        await supabase
          .from("subscriptions")
          .select("*, packages(name, price_monthly)")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
      ).data ?? [],
    enabled: !!user,
  });

  const [checkoutPkg, setCheckoutPkg] = useState<any | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null);
  const search = useSearch({ from: "/app/subscription" });

  // Handle Stripe redirect return
  useEffect(() => {
    if (search.stripe !== "success" || !search.sid || !search.pkg || !user) return;
    (async () => {
      try {
        const conf = await confirmStripeCheckout({ data: { session_id: search.sid! } });
        if (conf.payment_status !== "paid") {
          toast.error("Payment not completed");
          return;
        }
        const pkg = (packages ?? []).find((p: any) => p.id === search.pkg);
        if (!pkg) return;
        const now = new Date();
        const expires = new Date(now.getTime() + 30 * 86400000);
        if (mine)
          await supabase.from("subscriptions").update({ status: "cancelled" }).eq("id", mine.id);
        const { data } = await supabase
          .from("subscriptions")
          .insert({
            user_id: user.id,
            package_id: pkg.id,
            status: "active",
            started_at: now.toISOString(),
            expires_at: expires.toISOString(),
            amount_paid: conf.amount_total,
            currency: conf.currency,
            payment_method: "Stripe",
            receipt_id: conf.id,
          })
          .select("*, packages(name, price_monthly)")
          .single();
        toast.success("Payment successful");
        logAction(user.id, "payment.completed", pkg.name, {
          amount: conf.amount_total,
          receipt: conf.id,
        });
        setReceipt({ ...data, userEmail: conf.customer_email });
        qc.invalidateQueries();
        window.history.replaceState({}, "", "/app/subscription");
      } catch (e: any) {
        toast.error(e.message ?? "Could not confirm payment");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.stripe, search.sid, search.pkg, user?.id, packages]);

  useEffect(() => {
    if (search.stripe === "cancel") {
      toast.info("Payment cancelled");
      window.history.replaceState({}, "", "/app/subscription");
    }
  }, [search.stripe]);

  const currentPrice = Number(mine?.packages?.price_monthly ?? 0);
  const activeExpires = mine?.expires_at ? new Date(mine.expires_at) : null;
  const daysLeft = activeExpires
    ? Math.max(0, Math.ceil((activeExpires.getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
        <p className="text-sm text-muted-foreground">
          Pick a plan or upgrade anytime - you keep your access until the current period ends.
        </p>
      </div>

      {mine && (
        <Card className="relative overflow-hidden rounded-3xl border-primary/30 p-6 shadow-[var(--shadow-elevated)]">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/15 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                Current plan
              </div>
              <div className="mt-1 text-2xl font-bold">{mine.packages?.name}</div>
              <div className="text-sm text-muted-foreground">
                {ksh(currentPrice)} / month
                {activeExpires && ` · access until ${format(activeExpires, "MMM d, yyyy")}`}
                {daysLeft !== null && ` (${daysLeft} days left)`}
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/app/watch">Open player</Link>
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {(packages ?? []).map((p: any, idx: number) => {
          const Icon = ICONS[idx % ICONS.length];
          const isCurrent = mine?.package_id === p.id;
          const isUpgrade = mine && Number(p.price_monthly) > currentPrice;
          const isDowngrade = mine && Number(p.price_monthly) < currentPrice;
          const featured = idx === 1;
          return (
            <Card
              key={p.id}
              className={`relative overflow-hidden rounded-3xl p-7 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] ${isCurrent ? "border-primary ring-2 ring-primary/30" : featured ? "border-primary/40" : ""}`}
            >
              {isCurrent && (
                <Badge className="absolute right-5 top-5">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Active
                </Badge>
              )}
              {!isCurrent && featured && (
                <Badge variant="secondary" className="absolute right-5 top-5">
                  Most Popular
                </Badge>
              )}
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-2xl" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-glow)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-2xl font-bold">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-xs font-semibold text-muted-foreground">Ksh</span>
                  <span className="text-5xl font-extrabold tracking-tight">
                    {Number(p.price_monthly).toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <ul className="mt-5 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" /> {counts?.get(p.id) ?? 0} content
                    items
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" /> Up to {p.max_streams} concurrent
                    streams
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" /> Custom branding
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" /> HD playback
                  </li>
                </ul>
                <Button
                  className="mt-6 w-full rounded-xl"
                  disabled={isCurrent}
                  variant={isCurrent ? "outline" : "default"}
                  onClick={() => setCheckoutPkg(p)}
                >
                  {isCurrent
                    ? "Current plan"
                    : isUpgrade
                      ? "Upgrade"
                      : isDowngrade
                        ? "Switch"
                        : "Subscribe"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {history && history.length > 0 && (
        <Card className="rounded-2xl shadow-[var(--shadow-card)]">
          <div className="p-5 sm:p-6">
            <h3 className="text-lg font-semibold">Subscription History</h3>

            <div className="mt-5 divide-y divide-border">
              {history.map((h: any) => (
                <div
                  key={h.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Left */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold sm:text-base">
                      {h.packages?.name}
                    </p>

                    <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                      Receipt: {h.receipt_id ?? "-"}
                    </p>
                  </div>

                  {/* Right */}
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <p className="text-base font-bold">
                      {ksh(Number(h.amount_paid ?? h.packages?.price_monthly ?? 0))}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{format(new Date(h.started_at), "MMM d, yyyy")}</span>

                      <Badge variant={h.status === "active" ? "default" : "secondary"}>
                        {h.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {checkoutPkg && (
        <CheckoutDialog
          pkg={checkoutPkg}
          user={user}
          currentSub={mine}
          onClose={() => setCheckoutPkg(null)}
          onPaid={(r) => {
            setCheckoutPkg(null);
            setReceipt(r);
            qc.invalidateQueries();
          }}
        />
      )}
      {receipt && <ReceiptDialog receipt={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}

function CheckoutDialog({
  pkg,
  onClose,
}: {
  pkg: any;
  user: any;
  currentSub: any;
  onClose: () => void;
  onPaid: (r: any) => void;
}) {
  const [busy, setBusy] = useState(false);

  const go = async () => {
    setBusy(true);
    try {
      const { url } = await createStripeCheckout({
        data: { package_id: pkg.id, origin: window.location.origin },
      });
      window.location.href = url;
    } catch (e: any) {
      setBusy(false);
      toast.error(e.message ?? "Could not start checkout");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" /> Confirm checkout
          </DialogTitle>
        </DialogHeader>
        <div className="rounded-xl bg-secondary p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-semibold">{pkg.name}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Billed today</span>
            <span className="text-lg font-bold">{ksh(Number(pkg.price_monthly))}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Access</span>
            <span>30 days</span>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <span>
            You will be redirected to Stripe's secure checkout. In test mode use card{" "}
            <span className="font-mono">4242 4242 4242 4242</span>, any future expiry and any CVC.
          </span>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={go} disabled={busy} className="min-w-48">
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Continue to Stripe
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReceiptDialog({ receipt, onClose }: { receipt: any; onClose: () => void }) {
  const download = () => {
    const lines = [
      "DIGISTREAM - PAYMENT RECEIPT",
      "==============================",
      `Receipt: ${receipt.receipt_id}`,
      `Date:    ${format(new Date(receipt.started_at), "MMM d, yyyy HH:mm")}`,
      `Email:   ${receipt.userEmail ?? ""}`,
      "",
      `Plan:    ${receipt.packages?.name}`,
      `Method:  ${receipt.payment_method} · **** ${receipt.cardLast4 ?? ""}`,
      `Access:  until ${format(new Date(receipt.expires_at), "MMM d, yyyy")}`,
      "",
      `Amount:  ${ksh(Number(receipt.amount_paid))}`,
      "",
      "Thank you for your subscription.",
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${receipt.receipt_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" /> Payment successful
          </DialogTitle>
        </DialogHeader>
        <div className="rounded-2xl border border-dashed border-border p-5">
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Digistream Receipt
            </div>
            <div className="mt-1 font-mono text-sm">{receipt.receipt_id}</div>
          </div>
          <div className="my-4 h-px bg-border" />
          <dl className="space-y-1.5 text-sm">
            <Row k="Plan" v={receipt.packages?.name} />
            <Row k="Amount" v={ksh(Number(receipt.amount_paid))} />
            <Row k="Method" v={`${receipt.payment_method} · **** ${receipt.cardLast4 ?? ""}`} />
            <Row k="Date" v={format(new Date(receipt.started_at), "MMM d, yyyy HH:mm")} />
            <Row k="Access until" v={format(new Date(receipt.expires_at), "MMM d, yyyy")} />
          </dl>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={download}>
            <Download className="mr-2 h-4 w-4" /> Download receipt
          </Button>
          <Button asChild onClick={onClose}>
            <Link to="/app/watch">Start streaming</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ k, v }: { k: string; v: any }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-semibold text-right">{v}</dd>
    </div>
  );
}
