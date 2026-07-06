import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { CLIENTS } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/clients")({
  component: Clients,
});

function Clients() {
  const [q, setQ] = useState("");
  const rows = useMemo(() => CLIENTS.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())), [q]);

  return (
    <>
      <PageHeader
        title="Clients"
        description="Manage all tenants, subscriptions and workspace status."
        actions={
          <Button className="rounded-lg" onClick={() => toast.success("Invite sent")}>
            <Plus className="mr-2 h-4 w-4" />Invite client
          </Button>
        }
      />
      <Card className="rounded-2xl border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients…" className="h-9 rounded-lg border-border bg-secondary pl-9" />
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                <TableHead>Client</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Devices</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Since</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/40">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold text-white" style={{ background: c.logoColor }}>
                        {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.industry}</TableCell>
                  <TableCell><StatusBadge status={c.plan} /></TableCell>
                  <TableCell>{c.devices}</TableCell>
                  <TableCell>{c.users}</TableCell>
                  <TableCell className="font-medium">${c.mrr.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{c.since}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );
}
