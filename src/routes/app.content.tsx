import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Loader2, Film, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/content")({
  component: ContentPage,
});

function ContentPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-content"],
    queryFn: async () => (await supabase.from("content").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "", thumbnail_url: "", stream_url: "", duration_seconds: 0 });
  const [saving, setSaving] = useState(false);

  const create = async () => {
    setSaving(true);
    const { error } = await supabase.from("content").insert(form);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Content added");
    setOpen(false);
    setForm({ title: "", description: "", category: "", thumbnail_url: "", stream_url: "", duration_seconds: 0 });
    qc.invalidateQueries({ queryKey: ["admin-content"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this content?")) return;
    const { error } = await supabase.from("content").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-content"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Content Library</h1>
          <p className="text-sm text-muted-foreground">All streamable content on Digistream.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Content</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New content</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input className="mt-1.5" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea className="mt-1.5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Category</Label><Input className="mt-1.5" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
                <div><Label>Duration (s)</Label><Input className="mt-1.5" type="number" value={form.duration_seconds} onChange={(e) => setForm({ ...form, duration_seconds: Number(e.target.value) })} /></div>
              </div>
              <div><Label>Thumbnail URL</Label><Input className="mt-1.5" value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} /></div>
              <div><Label>Stream URL</Label><Input className="mt-1.5" value={form.stream_url} onChange={(e) => setForm({ ...form, stream_url: e.target.value })} placeholder="https://.../video.mp4" /></div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={create} disabled={saving || !form.title}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((c: any) => (
            <Card key={c.id} className="overflow-hidden rounded-2xl shadow-[var(--shadow-card)]">
              <div className="aspect-video overflow-hidden bg-secondary">
                {c.thumbnail_url ? <img src={c.thumbnail_url} className="h-full w-full object-cover" alt="" /> : <Film className="m-auto h-8 w-8 text-muted-foreground" />}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{c.title}</div>
                    <div className="text-xs text-muted-foreground">{c.category}</div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
