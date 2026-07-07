import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Check, Loader2, Sparkles, Zap, Crown, CreditCard, Lock, ShieldCheck, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { ksh } from "@/lib/currency";
import { logAction } from "@/lib/activity";
import { format } from "date-fns";

export const Route = createFileRoute("/app/subscription")({
  component: SubscriptionPage,
});

const ICONS = [Zap, Sparkles, Crown];

function SubscriptionPage() {
  const { user } = useSession();
  const qc = useQueryClient();

  const { data: packages } = useQuery({
    queryKey: ["packages-public"],
    queryFn: async () => (await supabase.from("packages").select("*").eq("active", true).order("price_monthly")).data ?? [],
  });
  const { data: mine } = useQuery({
    queryKey: ["my-sub", user?.id],
    queryFn: async () => (await supabase.from("subscriptions").select("*, packages(name, price_monthly)").eq("user_id", user!.id).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle()).data,
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
    queryFn: async () => (await supabase.from("subscriptions").select("*, packages(name, price_monthly)").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
    enabled: !!user,
  });

  const [checkoutPkg, setCheckoutPkg] = useState<any | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null);

  const currentPrice = Number(mine?.packages?.price_monthly ?? 0);
  const activeExpires = mine?.expires_at ? new Date(mine.expires_at) : null;
  const daysLeft = activeExpires ? Math.max(0, Math.ceil((activeExpires.getTime() - Date.now()) / 86400000)) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
        <p className="text-sm text-muted-foreground">Pick a plan or upgrade anytime - you keep your access until the current period ends.</p>
      </div>

      {mine && (
        <Card className="relative overflow-hidden rounded-3xl border-primary/30 p-6 shadow-[var(--shadow-elevated)]">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/15 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">Current plan</div>
              <div className="mt-1 text-2xl font-bold">{mine.packages?.name}</div>
              <div className="text-sm text-muted-foreground">
                {ksh(currentPrice)} / month
                {activeExpires && ` · access until ${format(activeExpires, "MMM d, yyyy")}`}
                {daysLeft !== null && ` (${daysLeft} days left)`}
              </div>
            </div>
            <Button asChild variant="outline"><Link to="/app/watch">Open player</Link></Button>
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
            <Card key={p.id} className={`relative overflow-hidden rounded-3xl p-7 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] ${isCurrent ? "border-primary ring-2 ring-primary/30" : featured ? "border-primary/40" : ""}`}>
              {isCurrent && <Badge className="absolute right-5 top-5"><CheckCircle2 className="mr-1 h-3 w-3" />Active</Badge>}
              {!isCurrent && featured && <Badge variant="secondary" className="absolute right-5 top-5">Most Popular</Badge>}
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-2xl" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-glow)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-2xl font-bold">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-xs font-semibold text-muted-foreground">Ksh</span>
                  <span className="text-5xl font-extrabold tracking-tight">{Number(p.price_monthly).toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <ul className="mt-5 space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> {counts?.get(p.id) ?? 0} content items</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Up to {p.max_streams} concurrent streams</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Custom branding</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> HD playback</li>
                </ul>
                <Button
                  className="mt-6 w-full rounded-xl"
                  disabled={isCurrent}
                  variant={isCurrent ? "outline" : "default"}
                  onClick={() => setCheckoutPkg(p)}
                >
                  {isCurrent ? "Current plan" : isUpgrade ? "Upgrade" : isDowngrade ? "Switch" : "Subscribe"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {history && history.length > 0 && (
        <Card className="rounded-2xl p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold">Subscription history</h3>
          <div className="mt-3 divide-y divide-border">
            {history.map((h: any) => (
              <div key={h.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-semibold">{h.packages?.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{h.receipt_id ?? "-"}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{ksh(Number(h.amount_paid ?? h.packages?.price_monthly ?? 0))}</div>
                  <div className="text-xs text-muted-foreground">{format(new Date(h.started_at), "MMM d, yyyy")} · <Badge variant={h.status === "active" ? "default" : "secondary"} className="ml-1">{h.status}</Badge></div>
                </div>
              </div>
            ))}
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

function CheckoutDialog({ pkg, user, currentSub, onClose, onPaid }: { pkg: any; user: any; currentSub: any; onClose: () => void; onPaid: (r: any) => void }) {
  const [card, setCard] = useState({ number: "4242 4242 4242 4242", exp: "12/28", cvc: "123", name: "" });
  const [busy, setBusy] = useState(false);

  const pay = async () => {
    if (!user) return;
    setBusy(true);
    // Simulate Stripe test charge
    await new Promise((r) => setTimeout(r, 1400));
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 86400000);
    const receiptId = "rcpt_" + Math.random().toString(36).slice(2, 12).toUpperCase();

    // If there's an active sub with a future expiry, keep access - mark old as cancelled but new one starts now.
    if (currentSub) {
      await supabase.from("subscriptions").update({ status: "cancelled" }).eq("id", currentSub.id);
    }
    const { data, error } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      package_id: pkg.id,
      status: "active",
      started_at: now.toISOString(),
      expires_at: expires.toISOString(),
      amount_paid: Number(pkg.price_monthly),
      currency: "KES",
      payment_method: "Card (Stripe test)",
      receipt_id: receiptId,
    }).select("*, packages(name, price_monthly)").single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Payment successful");
    logAction(user.id, "payment.completed", pkg.name, { amount: Number(pkg.price_monthly), receipt: receiptId });
    onPaid({ ...data, cardLast4: card.number.slice(-4), userEmail: user.email });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Complete payment</DialogTitle></DialogHeader>
        <div className="rounded-xl bg-secondary p-4">
          <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Plan</span><span className="font-semibold">{pkg.name}</span></div>
          <div className="mt-1 flex items-center justify-between text-sm"><span className="text-muted-foreground">Billed today</span><span className="text-lg font-bold">{ksh(Number(pkg.price_monthly))}</span></div>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground"><span>Access</span><span>30 days</span></div>
        </div>
        <div className="space-y-3">
          <div><Label>Cardholder name</Label><Input className="mt-1.5" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Full name on card" /></div>
          <div><Label>Card number</Label><Input className="mt-1.5 font-mono" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Expiry</Label><Input className="mt-1.5 font-mono" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} placeholder="MM/YY" /></div>
            <div><Label>CVC</Label><Input className="mt-1.5 font-mono" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} /></div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted p-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-success" />
          <span>Test mode · use <span className="font-mono">4242 4242 4242 4242</span> · no real charge.</span>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={pay} disabled={busy} className="min-w-40">
            {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</> : <><Lock className="mr-2 h-4 w-4" />Pay {ksh(Number(pkg.price_monthly))}</>}
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
    a.href = url; a.download = `${receipt.receipt_id}.txt`; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-success" /> Payment successful</DialogTitle></DialogHeader>
        <div className="rounded-2xl border border-dashed border-border p-5">
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Digistream Receipt</div>
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
          <Button variant="outline" onClick={download}><Download className="mr-2 h-4 w-4" /> Download receipt</Button>
          <Button asChild onClick={onClose}><Link to="/app/watch">Start streaming</Link></Button>
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
