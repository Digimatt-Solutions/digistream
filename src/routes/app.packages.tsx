import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Loader2, Package as PackageIcon, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/packages")({
  component: PackagesPage,
});

function PackagesPage() {
  const qc = useQueryClient();
  const { data: packages, isLoading } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: async () => (await supabase.from("packages").select("*").order("price_monthly")).data ?? [],
  });
  const { data: content } = useQuery({
    queryKey: ["all-content-simple"],
    queryFn: async () => (await supabase.from("content").select("id, title, category")).data ?? [],
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
    setForm({ name: p.name, description: p.description ?? "", price_monthly: Number(p.price_monthly), max_streams: p.max_streams });
    setSelected(new Set((mappings ?? []).filter((m: any) => m.package_id === p.id).map((m: any) => m.content_id)));
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
    // Sync package_content
    await supabase.from("package_content").delete().eq("package_id", pkgId);
    if (selected.size > 0) {
      await supabase.from("package_content").insert(Array.from(selected).map((cid) => ({ package_id: pkgId, content_id: cid })));
    }
    toast.success("Package saved");
    setOpen(false);
    qc.invalidateQueries();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Packages & Pricing</h1>
          <p className="text-sm text-muted-foreground">Bundles that clients subscribe to.</p>
        </div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />New Package</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {(packages ?? []).map((p: any) => {
            const items = (mappings ?? []).filter((m: any) => m.package_id === p.id).length;
            return (
              <Card key={p.id} className="rounded-2xl p-6 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><PackageIcon className="h-5 w-5" /></div>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                </div>
                <h3 className="mt-4 text-lg font-bold">{p.name}</h3>
                <p className="text-xs text-muted-foreground">{p.description}</p>
                <div className="mt-4 text-3xl font-bold">${Number(p.price_monthly).toFixed(0)}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <div>• {items} content items</div>
                  <div>• Up to {p.max_streams} concurrent streams</div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit package" : "New package"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input className="mt-1.5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Description</Label><Input className="mt-1.5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Price / month (USD)</Label><Input className="mt-1.5" type="number" value={form.price_monthly} onChange={(e) => setForm({ ...form, price_monthly: Number(e.target.value) })} /></div>
              <div><Label>Max streams</Label><Input className="mt-1.5" type="number" value={form.max_streams} onChange={(e) => setForm({ ...form, max_streams: Number(e.target.value) })} /></div>
            </div>
            <div>
              <Label>Included content</Label>
              <div className="mt-2 max-h-56 space-y-1.5 overflow-y-auto rounded-lg border border-border p-2">
                {(content ?? []).map((c: any) => (
                  <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded p-1.5 hover:bg-secondary">
                    <Checkbox
                      checked={selected.has(c.id)}
                      onCheckedChange={(v) => {
                        const next = new Set(selected);
                        v ? next.add(c.id) : next.delete(c.id);
                        setSelected(next);
                      }}
                    />
                    <span className="text-sm">{c.title} <span className="text-muted-foreground">· {c.category}</span></span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.name}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
