import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Loader2,
  Film,
  Trash2,
  Pencil,
  Music2,
  Video,
  Radio,
  Mic2,
  PlayCircle,
  Search,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/content")({
  component: ContentPage,
});

const TYPES = [
  { value: "video", label: "Videos", icon: Video },
  { value: "song", label: "Songs", icon: Music2 },
  { value: "mix", label: "Mixes", icon: Radio },
  { value: "podcast", label: "Podcasts", icon: Mic2 },
  { value: "live", label: "Live", icon: PlayCircle },
] as const;

function ContentPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-content"],
    queryFn: async () =>
      (await supabase.from("content").select("*").order("created_at", { ascending: false })).data ??
      [],
  });

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tab, setTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const emptyForm = {
    title: "",
    description: "",
    category: "",
    content_type: "video",
    artist: "",
    release_year: new Date().getFullYear(),
    thumbnail_url: "",
    stream_url: "",
    duration_seconds: 0,
  };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadPct(5);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      // Simulated progress while upload runs (supabase-js has no native progress)
      const ticker = setInterval(
        () => setUploadPct((p) => (p < 85 ? p + Math.max(1, Math.round((90 - p) / 8)) : p)),
        400,
      );
      const { error: upErr } = await supabase.storage
        .from("content")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      clearInterval(ticker);
      if (upErr) throw upErr;
      // 1-year signed URL — private bucket, signed so any signed-in viewer can stream
      const { data: signed, error: sErr } = await supabase.storage
        .from("content")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (sErr || !signed) throw sErr ?? new Error("Failed to sign URL");
      setForm((f) => ({
        ...f,
        stream_url: signed.signedUrl,
        content_type:
          f.content_type ||
          (file.type.startsWith("audio") ? "song" : "video"),
      }));
      setUploadPct(100);
      toast.success("Upload complete");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadPct(0);
      }, 400);
    }
  };

  const filtered = useMemo(() => {
    return (data ?? []).filter((c: any) => {
      if (tab !== "all" && (c.content_type ?? "video") !== tab) return false;
      if (
        search &&
        !`${c.title} ${c.artist ?? ""} ${c.category ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [data, tab, search]);

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = {};
    (filtered as any[]).forEach((c) => {
      const t = c.content_type ?? "video";
      (g[t] ||= []).push(c);
    });
    return g;
  }, [filtered]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: (data ?? []).length };
    TYPES.forEach((t) => (c[t.value] = 0));
    (data ?? []).forEach((r: any) => {
      c[r.content_type ?? "video"] = (c[r.content_type ?? "video"] ?? 0) + 1;
    });
    return c;
  }, [data]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (c: any) => {
    setEditingId(c.id);
    setForm({
      title: c.title ?? "",
      description: c.description ?? "",
      category: c.category ?? "",
      content_type: c.content_type ?? "video",
      artist: c.artist ?? "",
      release_year: c.release_year ?? new Date().getFullYear(),
      thumbnail_url: c.thumbnail_url ?? "",
      stream_url: c.stream_url ?? "",
      duration_seconds: c.duration_seconds ?? 0,
    });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    const { error } = editingId
      ? await supabase.from("content").update(form).eq("id", editingId)
      : await supabase.from("content").insert(form);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editingId ? "Content updated" : "Content added");
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
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
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Library</h1>
          <p className="text-sm text-muted-foreground">
            Organize videos, songs, mixes, podcasts and live streams.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, artist, category…"
              className="w-72 pl-9"
            />
          </div>
          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (!o) {
                setEditingId(null);
                setForm(emptyForm);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" /> Add Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit content" : "New content"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={form.content_type}
                      onValueChange={(v) => setForm({ ...form, content_type: v })}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Category / genre</Label>
                    <Input
                      className="mt-1.5"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="Afrobeat, Drama…"
                    />
                  </div>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    className="mt-1.5"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Artist / Creator</Label>
                    <Input
                      className="mt-1.5"
                      value={form.artist}
                      onChange={(e) => setForm({ ...form, artist: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input
                      className="mt-1.5"
                      type="number"
                      value={form.release_year}
                      onChange={(e) => setForm({ ...form, release_year: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    className="mt-1.5"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Duration (s)</Label>
                    <Input
                      className="mt-1.5"
                      type="number"
                      value={form.duration_seconds}
                      onChange={(e) =>
                        setForm({ ...form, duration_seconds: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label>Thumbnail URL</Label>
                    <Input
                      className="mt-1.5"
                      value={form.thumbnail_url}
                      onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Stream URL</Label>
                  <Input
                    className="mt-1.5"
                    value={form.stream_url}
                    onChange={(e) => setForm({ ...form, stream_url: e.target.value })}
                    placeholder="https://…/video.mp4"
                  />
                </div>
                <div className="rounded-lg border border-dashed border-border p-3">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Or upload from device
                  </Label>
                  <Input
                    type="file"
                    accept="video/*,audio/*"
                    className="mt-2 cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadFile(f);
                      e.target.value = "";
                    }}
                  />
                  {uploading && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${uploadPct}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Uploading… {uploadPct}%
                      </p>
                    </div>
                  )}
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Files are stored securely in Lovable Cloud. For very large videos
                    (over 500MB) consider hosting on a CDN like Bunny.net or Cloudflare
                    Stream and pasting the URL above.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={save} disabled={saving || !form.title}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Save changes" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">
            All{" "}
            <span className="ml-1.5 rounded-full bg-secondary px-1.5 text-[10px]">
              {counts.all ?? 0}
            </span>
          </TabsTrigger>
          {TYPES.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              <t.icon className="mr-1.5 h-3.5 w-3.5" /> {t.label}{" "}
              <span className="ml-1.5 rounded-full bg-secondary px-1.5 text-[10px]">
                {counts[t.value] ?? 0}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="rounded-2xl p-12 text-center shadow-[var(--shadow-card)]">
          <Film className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No content matches this filter.</p>
        </Card>
      ) : tab === "all" ? (
        <div className="space-y-8">
          {TYPES.filter((t) => grouped[t.value]?.length).map((t) => (
            <section key={t.value}>
              <div className="mb-3 flex items-center gap-2">
                <t.icon className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-bold">{t.label}</h2>
                <span className="text-xs text-muted-foreground">· {grouped[t.value].length}</span>
              </div>
              <ContentGrid items={grouped[t.value]} onDelete={remove} onEdit={openEdit} />
            </section>
          ))}
        </div>
      ) : (
        <ContentGrid items={filtered} onDelete={remove} onEdit={openEdit} />
      )}
    </div>
  );
}

function ContentGrid({
  items,
  onDelete,
  onEdit,
}: {
  items: any[];
  onDelete: (id: string) => void;
  onEdit: (c: any) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((c) => (
        <Card
          key={c.id}
          className="group overflow-hidden rounded-2xl shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
        >
          <div className="relative aspect-video overflow-hidden bg-secondary">
            {c.thumbnail_url ? (
              <img
                src={c.thumbnail_url}
                className="h-full w-full object-cover transition group-hover:scale-105"
                alt=""
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Film className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white capitalize">
              {c.content_type ?? "video"}
            </span>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate font-semibold">{c.title}</div>
                <div className="text-xs text-muted-foreground">
                  {c.artist ? `${c.artist} - ` : ""}
                  {c.category}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => onEdit(c)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(c.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
