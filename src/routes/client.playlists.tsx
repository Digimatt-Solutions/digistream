import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PLAYLISTS } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { ListVideo, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/client/playlists")({
  component: MyPlaylists,
});

function MyPlaylists() {
  const { user } = useAuth();
  const clientId = user?.clientId ?? "c1";
  const rows = PLAYLISTS.filter(p => p.clientId === clientId);
  return (
    <>
      <PageHeader
        title="My Playlists"
        description="Curated schedules of licensed content pushed to your devices."
        actions={<Button className="rounded-lg" onClick={() => toast.success("Playlist created")}><Plus className="mr-2 h-4 w-4" />New playlist</Button>}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((p) => (
          <Card key={p.id} className="group rounded-2xl border-border bg-card p-5 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-elevated)]">
            <div className="flex h-24 items-center justify-center rounded-xl text-white" style={{ background: "var(--gradient-primary)" }}>
              <ListVideo className="h-10 w-10 opacity-80" />
            </div>
            <h3 className="mt-4 font-semibold">{p.name}</h3>
            <div className="mt-1 text-xs text-muted-foreground">{p.items} items · {p.duration}</div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Pushed to {p.devices} devices</span>
              <span className="text-muted-foreground">{p.updated}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 rounded-lg">Edit</Button>
              <Button size="sm" className="flex-1 rounded-lg">Push</Button>
            </div>
          </Card>
        ))}
        {rows.length === 0 && (
          <Card className="col-span-full rounded-2xl border-dashed border-border bg-card p-10 text-center shadow-[var(--shadow-card)]">
            <p className="text-sm text-muted-foreground">No playlists yet — create one from the catalogue.</p>
          </Card>
        )}
      </div>
    </>
  );
}
