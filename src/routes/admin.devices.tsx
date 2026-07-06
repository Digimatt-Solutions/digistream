import { createFileRoute } from "@tanstack/react-router";
import { Plus, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { CLIENTS, DEVICES } from "@/lib/mock-data";
import { KpiCard } from "@/components/kpi-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/devices")({
  component: Devices,
});

const clientName = (id: string) => CLIENTS.find((c) => c.id === id)?.name ?? "—";

function Devices() {
  const online = DEVICES.filter((d) => d.status === "online").length;
  const offline = DEVICES.filter((d) => d.status === "offline").length;
  const syncing = DEVICES.filter((d) => d.status === "syncing").length;

  return (
    <>
      <PageHeader
        title="Device Fleet"
        description="Register, monitor and assign playlists to player devices."
        actions={
          <>
            <Button variant="outline" className="rounded-lg" onClick={() => toast.info("Sync triggered")}>
              <RefreshCw className="mr-2 h-4 w-4" />Sync fleet
            </Button>
            <Button className="rounded-lg" onClick={() => toast.success("Provisioning code generated")}>
              <Plus className="mr-2 h-4 w-4" />Register device
            </Button>
          </>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <KpiCard label="Online" value={String(online)} icon={Wifi} tone="success" />
        <KpiCard label="Offline" value={String(offline)} icon={WifiOff} tone="warning" />
        <KpiCard label="Syncing" value={String(syncing)} icon={RefreshCw} tone="info" />
        <KpiCard label="Total devices" value={String(DEVICES.length)} icon={Plus} tone="primary" />
      </div>
      <Card className="rounded-2xl border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                <TableHead>Device</TableHead>
                <TableHead>Device ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Playlist</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Last seen</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEVICES.map((d) => (
                <TableRow key={d.id} className="hover:bg-muted/40">
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell><code className="rounded bg-secondary px-1.5 py-0.5 text-xs">{d.deviceId}</code></TableCell>
                  <TableCell className="text-muted-foreground">{clientName(d.clientId)}</TableCell>
                  <TableCell>{d.playlist}</TableCell>
                  <TableCell className="text-muted-foreground">{d.location}</TableCell>
                  <TableCell>{d.uptime}</TableCell>
                  <TableCell className="text-muted-foreground">{d.lastSeen}</TableCell>
                  <TableCell><StatusBadge status={d.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );
}
