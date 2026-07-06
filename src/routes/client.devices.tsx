import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { DEVICES } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/client/devices")({
  component: MyDevices,
});

function MyDevices() {
  const { user } = useAuth();
  const clientId = user?.clientId ?? "c1";
  const rows = DEVICES.filter(d => d.clientId === clientId);

  return (
    <>
      <PageHeader
        title="My Devices"
        description={`${rows.length} devices assigned to your workspace.`}
        actions={
          <>
            <Button variant="outline" className="rounded-lg" onClick={() => toast.info("Syncing…")}>
              <RefreshCw className="mr-2 h-4 w-4" />Sync all
            </Button>
            <Button className="rounded-lg" onClick={() => toast.success("Pairing code: 8H2-4KP")}>
              <Plus className="mr-2 h-4 w-4" />Pair device
            </Button>
          </>
        }
      />
      <Card className="rounded-2xl border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                <TableHead>Device</TableHead>
                <TableHead>Playlist</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Last seen</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? rows.map((d) => (
                <TableRow key={d.id} className="hover:bg-muted/40">
                  <TableCell>
                    <div className="font-medium">{d.name}</div>
                    <code className="text-[11px] text-muted-foreground">{d.deviceId}</code>
                  </TableCell>
                  <TableCell>{d.playlist}</TableCell>
                  <TableCell className="text-muted-foreground">{d.location}</TableCell>
                  <TableCell>{d.uptime}</TableCell>
                  <TableCell className="text-muted-foreground">{d.lastSeen}</TableCell>
                  <TableCell><StatusBadge status={d.status} /></TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">No devices paired yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );
}
