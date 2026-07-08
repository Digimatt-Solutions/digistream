import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/app/activity")({
  component: ActivityPage,
});

const ACTION_TINTS: Record<string, string> = {
  "page.view": "bg-info/15 text-info",
  "profile.updated": "bg-success/15 text-success",
  "subscription.changed": "bg-primary/15 text-primary",
  "payment.completed": "bg-success/15 text-success",
};

const PAGE_SIZE = 15;

function ActivityPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["activity-logs", page, search],
    queryFn: async () => {
      let q = supabase
        .from("activity_logs")
        .select("*, profiles(full_name, email, avatar_url)", { count: "exact" })
        .order("created_at", { ascending: false });
      if (search) q = q.or(`action.ilike.%${search}%,entity.ilike.%${search}%,page.ilike.%${search}%`);
      const { data, count } = await q.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      return { rows: data ?? [], total: count ?? 0 };
    },
  });

  const filtered = data?.rows ?? [];
  const total = data?.total ?? 0;


  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-sm text-muted-foreground">Full trail of user actions and page visits across the platform.</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="Search user, action, page…" className="w-72 pl-9" />
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl p-0 shadow-[var(--shadow-card)]">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-16 text-center text-muted-foreground">
            <Activity className="h-8 w-8" />
            <p>No activity yet. As users interact, page visits and actions will appear here.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>When</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Page / Entity</TableHead>
                  <TableHead className="text-right">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((l: any) => (
                  <TableRow key={l.id} className="hover:bg-muted/30">
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {(l.profiles?.full_name ?? l.profiles?.email ?? "?").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{l.profiles?.full_name ?? l.profiles?.email ?? "System"}</div>
                          <div className="truncate text-[11px] text-muted-foreground">{l.profiles?.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${ACTION_TINTS[l.action] ?? "bg-secondary text-secondary-foreground"}`}>
                        {l.action}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{l.entity ?? "-"}</div>
                      {l.page && <div className="text-[11px] text-muted-foreground font-mono">{l.page}</div>}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right text-xs text-muted-foreground">
                      {format(new Date(l.created_at), "MMM d, yyyy · HH:mm:ss")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-3">
              <div className="text-xs text-muted-foreground">
                Showing <b>{page * PAGE_SIZE + 1}</b>-<b>{Math.min((page + 1) * PAGE_SIZE, total)}</b> of <b>{total}</b> records
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <div className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</div>
                <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page + 1 >= totalPages}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
