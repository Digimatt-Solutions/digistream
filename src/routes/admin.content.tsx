import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter, Plus, Search, Upload } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { CONTENT, type ContentType } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/content")({
  component: ContentLibrary,
});

const TYPES: (ContentType | "All")[] = ["All", "Movie", "TV Show", "Audio", "DJ Mix", "Podcast", "Live Stream", "Promo"];

function ContentLibrary() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<ContentType | "All">("All");
  const [status, setStatus] = useState<string>("All");

  const rows = useMemo(() => CONTENT.filter((c) =>
    (type === "All" || c.type === type) &&
    (status === "All" || c.status === status) &&
    c.title.toLowerCase().includes(q.toLowerCase())
  ), [q, type, status]);

  return (
    <>
      <PageHeader
        title="Content Library"
        description="128 assets across movies, series, audio, live and promos."
        actions={
          <>
            <Button variant="outline" className="rounded-lg"><Filter className="mr-2 h-4 w-4" />Filters</Button>
            <Button variant="outline" className="rounded-lg"><Upload className="mr-2 h-4 w-4" />Import</Button>
            <Button className="rounded-lg" onClick={() => toast.success("New content draft created")}>
              <Plus className="mr-2 h-4 w-4" />New content
            </Button>
          </>
        }
      />
      <Card className="rounded-2xl border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles…" className="h-9 rounded-lg border-border bg-secondary pl-9" />
          </div>
          <Select value={type} onValueChange={(v) => setType(v as any)}>
            <SelectTrigger className="h-9 w-[140px] rounded-lg"><SelectValue /></SelectTrigger>
            <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-[140px] rounded-lg"><SelectValue /></SelectTrigger>
            <SelectContent>{["All","Published","Draft","Scheduled","Archived"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/40">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-12 items-center justify-center rounded-md text-[10px] font-semibold text-white" style={{ background: c.thumbColor }}>
                        {c.type.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium">{c.title}</span>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-muted-foreground">{c.type}</span></TableCell>
                  <TableCell>{c.category}</TableCell>
                  <TableCell>{c.duration}</TableCell>
                  <TableCell>{c.views.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{c.updated}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">No content matches your filters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );
}
