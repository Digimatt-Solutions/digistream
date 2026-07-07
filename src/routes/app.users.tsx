import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/app/users")({
  component: UsersPage,
});

function UsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const [profiles, roles, subs] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("subscriptions").select("user_id, status, packages(name)").eq("status", "active"),
      ]);
      const roleMap = new Map((roles.data ?? []).map((r) => [r.user_id, r.role]));
      const subMap = new Map((subs.data ?? []).map((s: any) => [s.user_id, s.packages?.name]));
      return (profiles.data ?? []).map((p: any) => ({ ...p, role: roleMap.get(p.id), plan: subMap.get(p.id) }));
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-sm text-muted-foreground">All users registered on Digistream.</p>
      </div>
      <Card className="rounded-2xl p-0 shadow-[var(--shadow-card)]">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell><Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">{u.role ?? "-"}</Badge></TableCell>
                  <TableCell>{u.plan ?? <span className="text-muted-foreground">No plan</span>}</TableCell>
                  <TableCell className="text-muted-foreground">{u.created_at && format(new Date(u.created_at), "MMM d, yyyy")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
