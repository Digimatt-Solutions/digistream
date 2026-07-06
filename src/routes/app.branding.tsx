import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Palette } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/branding")({
  component: BrandingPage,
});

function BrandingPage() {
  const { user } = useSession();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["brand", user?.id],
    queryFn: async () => (await supabase.from("client_brands").select("*").eq("user_id", user!.id).maybeSingle()).data,
    enabled: !!user,
  });
  const [form, setForm] = useState({ brand_name: "", tagline: "", primary_color: "#f97316", logo_url: "" });
  useEffect(() => {
    if (data) setForm({ brand_name: data.brand_name ?? "", tagline: data.tagline ?? "", primary_color: data.primary_color ?? "#f97316", logo_url: data.logo_url ?? "" });
  }, [data]);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("client_brands").upsert({ user_id: user!.id, ...form, updated_at: new Date().toISOString() });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Brand saved");
    qc.invalidateQueries({ queryKey: ["brand"] });
    await supabase.from("activity_logs").insert({ user_id: user!.id, action: "brand.updated", entity: "client_brand" });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Custom Branding</h1>
        <p className="text-sm text-muted-foreground">Customize how content appears to your end users.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl p-6 shadow-[var(--shadow-card)]">
          <h3 className="flex items-center gap-2 font-semibold"><Palette className="h-4 w-4 text-primary" /> Brand settings</h3>
          <div className="mt-4 space-y-3">
            <div><Label>Brand name</Label><Input className="mt-1.5" value={form.brand_name} onChange={(e) => setForm({ ...form, brand_name: e.target.value })} placeholder="Acme Media" /></div>
            <div><Label>Tagline</Label><Input className="mt-1.5" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Great content, anywhere" /></div>
            <div><Label>Logo URL</Label><Input className="mt-1.5" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://…" /></div>
            <div><Label>Primary color</Label>
              <div className="mt-1.5 flex items-center gap-2">
                <input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="h-10 w-14 cursor-pointer rounded-lg border border-border" />
                <Input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} />
              </div>
            </div>
            <Button className="w-full" onClick={save} disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save brand</Button>
          </div>
        </Card>

        <Card className="overflow-hidden rounded-2xl shadow-[var(--shadow-card)]">
          <div className="p-4 text-xs uppercase tracking-wide text-muted-foreground">Live preview</div>
          <div className="p-8" style={{ background: `linear-gradient(135deg, ${form.primary_color}, ${form.primary_color}80)` }}>
            <div className="flex items-center gap-3 text-white">
              {form.logo_url ? <img src={form.logo_url} alt="" className="h-10 w-auto" /> : <div className="h-10 w-10 rounded-lg bg-white/20" />}
              <div>
                <div className="text-lg font-bold">{form.brand_name || "Your brand"}</div>
                <div className="text-sm opacity-90">{form.tagline || "Your tagline appears here"}</div>
              </div>
            </div>
            <div className="mt-6 aspect-video rounded-xl bg-black/40 backdrop-blur" />
          </div>
        </Card>
      </div>
    </div>
  );
}
