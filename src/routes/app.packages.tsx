import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Loader2,
  Package as PackageIcon,
  Pencil,
  Check,
  Sparkles,
  Crown,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { ksh } from "@/lib/currency";

export const Route = createFileRoute("/app/packages")({
  component: PackagesPage,
});

const TIER_ICONS = [Zap, Sparkles, Crown];

function PackagesPage() {
  const qc = useQueryClient();
  const { data: packages, isLoading } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: async () =>
      (await supabase.from("packages").select("*").order("price_monthly")).data ?? [],
  });
  const { data: content } = useQuery({
    queryKey: ["all-content-simple"],
    queryFn: async () =>
      (await supabase.from("content").select("id, title, category, content_type")).data ?? [],
  });
  const { data: mappings } = useQuery({
    queryKey: ["package-content"],
    queryFn: async () => (await supabase.from("package_content").select("*")).data ?? [],
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price_monthly: 0, max_streams: 1 });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", description: "", price_monthly: 0, max_streams: 1 });
    setSelected(new Set());
    setOpen(true);
  };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      price_monthly: Number(p.price_monthly),
      max_streams: p.max_streams,
    });
    setSelected(
      new Set(
        (mappings ?? []).filter((m: any) => m.package_id === p.id).map((m: any) => m.content_id),
      ),
    );
    setOpen(true);
  };

  const save = async () => {
    let pkgId = editing?.id;
    if (editing) {
      const { error } = await supabase.from("packages").update(form).eq("id", editing.id);
      if (error) return toast.error(error.message);
    } else {
      const { data, error } = await supabase.from("packages").insert(form).select("id").single();
      if (error) return toast.error(error.message);
      pkgId = data.id;
    }
    await supabase.from("package_content").delete().eq("package_id", pkgId);
    if (selected.size > 0) {
      await supabase
        .from("package_content")
        .insert(Array.from(selected).map((cid) => ({ package_id: pkgId, content_id: cid })));
    }
    toast.success("Package saved");
    setOpen(false);
    qc.invalidateQueries();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Packages & Pricing</h1>
          <p className="text-sm text-muted-foreground">
            Curated content bundles your clients subscribe to.
          </p>
        </div>
        <Button onClick={openNew} size="lg" className="rounded-xl">
          <Plus className="mr-2 h-4 w-4" />
          New Package
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {(packages ?? []).map((p: any, idx: number) => {
            const items = (mappings ?? []).filter((m: any) => m.package_id === p.id).length;
            const Icon = TIER_ICONS[idx % TIER_ICONS.length];
            const featured = idx === 1;
            return (
              <Card
                key={p.id}
                className={`group relative overflow-hidden rounded-3xl p-7 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] ${featured ? "border-primary/50 ring-1 ring-primary/30" : ""}`}
              >
                {featured && <Badge className="absolute right-5 top-5">Most Popular</Badge>}
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-2xl transition group-hover:from-primary/30" />
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-glow)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold tracking-tight">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {p.description || "Great value bundle."}
                  </p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-xs font-semibold text-muted-foreground">Ksh</span>
                    <span className="text-5xl font-extrabold tracking-tight">
                      {Number(p.price_monthly).toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  <div className="my-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  <ul className="space-y-2.5 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>
                        <b>{items}</b> content items included
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>
                        Up to <b>{p.max_streams}</b> concurrent streams
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>Custom branding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>Full month access, upgradable anytime</span>
                    </li>
                  </ul>
                  <Button
                    variant="outline"
                    className="mt-6 w-full rounded-xl"
                    onClick={() => openEdit(p)}
                  >
                    <Pencil className="mr-2 h-3.5 w-3.5" /> Edit package
                  </Button>
                </div>
              </Card>
            );
          })}
          {(packages ?? []).length === 0 && (
            <Card className="col-span-full rounded-2xl p-12 text-center shadow-[var(--shadow-card)]">
              <PackageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No packages yet. Create your first bundle.
              </p>
            </Card>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit package" : "New package"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                className="mt-1.5"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                className="mt-1.5"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price / month (Ksh)</Label>
                <Input
                  className="mt-1.5"
                  type="number"
                  value={form.price_monthly}
                  onChange={(e) => setForm({ ...form, price_monthly: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Max streams</Label>
                <Input
                  className="mt-1.5"
                  type="number"
                  value={form.max_streams}
                  onChange={(e) => setForm({ ...form, max_streams: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Included content ({selected.size})</Label>
              <div className="mt-2 max-h-56 space-y-1.5 overflow-y-auto rounded-lg border border-border p-2">
                {(content ?? []).map((c: any) => (
                  <label
                    key={c.id}
                    className="flex cursor-pointer items-center gap-2 rounded p-1.5 hover:bg-secondary"
                  >
                    <Checkbox
                      checked={selected.has(c.id)}
                      onCheckedChange={(v) => {
                        const next = new Set(selected);
                        v ? next.add(c.id) : next.delete(c.id);
                        setSelected(next);
                      }}
                    />
                    <span className="text-sm">
                      {c.title}{" "}
                      <span className="text-muted-foreground">
                        · {c.content_type ?? "video"} · {c.category}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!form.name}>
              Save · {ksh(form.price_monthly)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
