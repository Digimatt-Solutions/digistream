import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Palette, Image as ImageIcon, Type, Sparkles, PlayCircle, Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/branding")({
  component: BrandingPage,
});

const FONTS = ["Quicksand", "Inter", "Poppins", "Roboto", "Montserrat", "Playfair Display"];

function BrandingPage() {
  const { user } = useSession();
  const qc = useQueryClient();
  const logoInput = useRef<HTMLInputElement>(null);
  const thumbInput = useRef<HTMLInputElement>(null);

  const { data } = useQuery({
    queryKey: ["brand", user?.id],
    queryFn: async () => (await supabase.from("client_brands").select("*").eq("user_id", user!.id).maybeSingle()).data,
    enabled: !!user,
  });

  const [form, setForm] = useState({
    brand_name: "", tagline: "", logo_url: "",
    primary_color: "#f97316", secondary_color: "#0ea5e9", accent_color: "#22c55e",
    background_type: "gradient", theme_mode: "light", font_family: "Quicksand",
    default_thumbnail_url: "", player_title: "", welcome_message: "",
    support_email: "", website_url: "",
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "thumb" | null>(null);

  useEffect(() => {
    if (data) setForm((f) => ({ ...f, ...(data as any) }));
  }, [data]);

  const uploadImage = async (file: File, prefix: string) => {
    const ext = file.name.split(".").pop() || "png";
    const path = `${user!.id}/brand-${prefix}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365);
    return signed?.signedUrl ?? "";
  };

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>, target: "logo" | "thumb") => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Image too large (max 5 MB)");
    setUploading(target);
    try {
      const url = await uploadImage(file, target);
      if (target === "logo") setForm((f) => ({ ...f, logo_url: url }));
      else setForm((f) => ({ ...f, default_thumbnail_url: url }));
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("client_brands").upsert({ user_id: user!.id, ...form, updated_at: new Date().toISOString() } as never);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Brand saved");
    qc.invalidateQueries({ queryKey: ["brand"] });
    await supabase.from("activity_logs").insert({ user_id: user!.id, action: "brand.updated", entity: "client_brand" } as never);
  };

  const bg = form.background_type === "gradient"
    ? `linear-gradient(135deg, ${form.primary_color}, ${form.secondary_color})`
    : form.primary_color;

  return (
    <div className="mx-auto max-w-6xl space-y-6" style={{ fontFamily: form.font_family }}>
      <div>
        <h1 className="text-2xl font-bold">Custom Branding</h1>
        <p className="text-sm text-muted-foreground">Fine-tune every touchpoint of your player experience.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="rounded-2xl p-6 shadow-[var(--shadow-card)]">
          <Tabs defaultValue="identity">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="identity"><Sparkles className="mr-1 h-3.5 w-3.5" />Identity</TabsTrigger>
              <TabsTrigger value="colors"><Palette className="mr-1 h-3.5 w-3.5" />Colors</TabsTrigger>
              <TabsTrigger value="type"><Type className="mr-1 h-3.5 w-3.5" />Type</TabsTrigger>
              <TabsTrigger value="player"><PlayCircle className="mr-1 h-3.5 w-3.5" />Player</TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="mt-4 space-y-4">
              <div><Label>Brand name</Label><Input className="mt-1.5" value={form.brand_name} onChange={(e) => setForm({ ...form, brand_name: e.target.value })} placeholder="Acme Media" /></div>
              <div><Label>Tagline</Label><Input className="mt-1.5" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Great content, anywhere" /></div>
              <div>
                <Label>Logo</Label>
                <div className="mt-1.5 flex items-center gap-3">
                  {form.logo_url ? <img src={form.logo_url} alt="" className="h-14 w-auto rounded border" /> : <div className="flex h-14 w-14 items-center justify-center rounded border border-dashed text-muted-foreground"><ImageIcon className="h-5 w-5" /></div>}
                  <Button type="button" variant="outline" onClick={() => logoInput.current?.click()} disabled={uploading === "logo"}>
                    {uploading === "logo" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}Upload from device
                  </Button>
                  <input ref={logoInput} type="file" accept="image/*" className="hidden" onChange={(e) => onPick(e, "logo")} />
                </div>
                <Input className="mt-2" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="Or paste image URL" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Support email</Label><Input className="mt-1.5" value={form.support_email} onChange={(e) => setForm({ ...form, support_email: e.target.value })} placeholder="help@acme.com" /></div>
                <div><Label>Website</Label><Input className="mt-1.5" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="https://acme.com" /></div>
              </div>
            </TabsContent>

            <TabsContent value="colors" className="mt-4 space-y-4">
              <div>
                <Label>Background style</Label>
                <Select value={form.background_type} onValueChange={(v) => setForm({ ...form, background_type: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid color</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {[
                ["Primary", "primary_color"],
                ["Secondary", "secondary_color"],
                ["Accent", "accent_color"],
              ].map(([lbl, key]) => (
                <div key={key}>
                  <Label>{lbl}</Label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input type="color" value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value } as any)} className="h-10 w-14 cursor-pointer rounded-lg border border-border" />
                    <Input value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value } as any)} />
                  </div>
                </div>
              ))}
              <div>
                <Label>Theme mode</Label>
                <Select value={form.theme_mode} onValueChange={(v) => setForm({ ...form, theme_mode: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto (system)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="type" className="mt-4 space-y-4">
              <div>
                <Label>Font family</Label>
                <Select value={form.font_family} onValueChange={(v) => setForm({ ...form, font_family: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{FONTS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Welcome message</Label><Textarea className="mt-1.5" rows={3} value={form.welcome_message} onChange={(e) => setForm({ ...form, welcome_message: e.target.value })} placeholder="Displayed on the player home." /></div>
            </TabsContent>

            <TabsContent value="player" className="mt-4 space-y-4">
              <div><Label>Player title</Label><Input className="mt-1.5" value={form.player_title} onChange={(e) => setForm({ ...form, player_title: e.target.value })} placeholder="Acme Streaming" /></div>
              <div>
                <Label>Default thumbnail (shown when nothing is streaming)</Label>
                <div className="mt-1.5 flex items-center gap-3">
                  {form.default_thumbnail_url ? <img src={form.default_thumbnail_url} alt="" className="h-16 w-28 rounded object-cover border" /> : <div className="flex h-16 w-28 items-center justify-center rounded border border-dashed text-muted-foreground"><ImageIcon className="h-5 w-5" /></div>}
                  <Button type="button" variant="outline" onClick={() => thumbInput.current?.click()} disabled={uploading === "thumb"}>
                    {uploading === "thumb" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}Upload
                  </Button>
                  <input ref={thumbInput} type="file" accept="image/*" className="hidden" onChange={(e) => onPick(e, "thumb")} />
                </div>
                <Input className="mt-2" value={form.default_thumbnail_url} onChange={(e) => setForm({ ...form, default_thumbnail_url: e.target.value })} placeholder="Or paste image URL" />
              </div>
            </TabsContent>
          </Tabs>
          <Button className="mt-6 w-full" onClick={save} disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save brand</Button>
        </Card>

        <Card className="overflow-hidden rounded-2xl shadow-[var(--shadow-card)]" style={{ fontFamily: form.font_family }}>
          <div className="p-4 text-xs uppercase tracking-wide text-muted-foreground">Live preview</div>
          <div className="p-8 text-white" style={{ background: bg }}>
            <div className="flex items-center gap-3">
              {form.logo_url ? <img src={form.logo_url} alt="" className="h-10 w-auto" /> : <div className="h-10 w-10 rounded-lg bg-white/20" />}
              <div>
                <div className="text-lg font-bold">{form.brand_name || "Your brand"}</div>
                <div className="text-sm opacity-90">{form.tagline || "Your tagline appears here"}</div>
              </div>
            </div>
            {form.welcome_message && <p className="mt-4 text-sm opacity-95">{form.welcome_message}</p>}
            <div className="mt-6 aspect-video overflow-hidden rounded-xl bg-black/40 backdrop-blur">
              {form.default_thumbnail_url && <img src={form.default_thumbnail_url} alt="" className="h-full w-full object-cover opacity-90" />}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button style={{ background: form.accent_color }} className="rounded-lg px-3 py-1.5 text-sm font-semibold">Play now</button>
              <button className="rounded-lg border border-white/40 bg-white/10 px-3 py-1.5 text-sm">More info</button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
