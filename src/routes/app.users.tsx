import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, Trash2, Plus, Search, UserCog } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAvatarUrl } from "@/lib/avatar";
import { adminCreateUser, adminDeleteUser, adminUpdateUser } from "@/lib/user-admin.functions";
import { logAction } from "@/lib/activity";

export const Route = createFileRoute("/app/users")({ component: UsersPage });

function UserAvatar({ url, name }: { url?: string | null; name?: string | null }) {
  const resolved = useAvatarUrl(url ?? null);
  const initials = (name ?? "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  return resolved ? (
    <img src={resolved} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20" />
  ) : (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-xs font-bold text-primary-foreground">
      {initials}
    </div>
  );
}

function UsersPage() {
  const qc = useQueryClient();
  const { user: me } = useSession();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<any | null>(null);

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

  const filtered = (data ?? []).filter((u: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return `${u.full_name ?? ""} ${u.email ?? ""} ${u.role ?? ""}`.toLowerCase().includes(s);
  });

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await adminDeleteUser({ data: { user_id: deleting.id } });
      logAction(me?.id, "admin.user.deleted", deleting.email);
      toast.success("User deleted");
      qc.invalidateQueries({ queryKey: ["all-users"] });
    } catch (e: any) { toast.error(e.message); }
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">All users registered on Digistream.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className="w-64 pl-9" />
          </div>
          <Button onClick={() => setCreating(true)}><Plus className="mr-2 h-4 w-4" />Add user</Button>
        </div>
      </div>

      <Card className="rounded-2xl p-0 shadow-[var(--shadow-card)]">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u: any) => (
                  <TableRow key={u.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserAvatar url={u.avatar_url} name={u.full_name ?? u.email} />
                        <div className="min-w-0">
                          <div className="truncate font-medium">{u.full_name || "-"}</div>
                          <div className="truncate text-xs text-muted-foreground">{u.phone ?? ""}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell><Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">{u.role ?? "-"}</Badge></TableCell>
                    <TableCell>{u.plan ?? <span className="text-muted-foreground">No plan</span>}</TableCell>
                    <TableCell className="text-muted-foreground">{u.created_at && format(new Date(u.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditing(u)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleting(u)} disabled={u.id === me?.id}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No users found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {editing && <EditDialog user={editing} onClose={() => setEditing(null)} onSaved={() => { qc.invalidateQueries({ queryKey: ["all-users"] }); setEditing(null); }} />}
      {creating && <CreateDialog onClose={() => setCreating(false)} onCreated={() => { qc.invalidateQueries({ queryKey: ["all-users"] }); setCreating(false); }} />}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove <b>{deleting?.email}</b> and all their subscription records. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EditDialog({ user, onClose, onSaved }: { user: any; onClose: () => void; onSaved: () => void }) {
  const { user: me } = useSession();
  const [full_name, setName] = useState(user.full_name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [company, setCompany] = useState(user.company ?? "");
  const [role, setRole] = useState<"admin" | "client">(user.role ?? "client");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      await adminUpdateUser({ data: { user_id: user.id, full_name, email, phone, company, role } });
      logAction(me?.id, "admin.user.updated", email);
      toast.success("User updated");
      onSaved();
    } catch (e: any) { toast.error(e.message); }
    setBusy(false);
  };
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><UserCog className="h-5 w-5 text-primary" />Edit user</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label>Full name</Label><Input value={full_name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          </div>
          <div><Label>Company</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} /></div>
          <div><Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="client">Client</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { user: me } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [full_name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "client">("client");
  const [busy, setBusy] = useState(false);
  const create = async () => {
    if (!email || !password) return toast.error("Email and password required");
    setBusy(true);
    try {
      await adminCreateUser({ data: { email, password, full_name, role } });
      logAction(me?.id, "admin.user.created", email);
      toast.success("User created");
      onCreated();
    } catch (e: any) { toast.error(e.message); }
    setBusy(false);
  };
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" />Add new user</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label>Full name</Label><Input value={full_name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" /></div>
          <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" /></div>
          <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min 6 characters" /></div>
          <div><Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="client">Client</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={create} disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create user</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
