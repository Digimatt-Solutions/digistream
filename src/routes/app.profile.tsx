import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useSession();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const [form, setForm] = useState({ full_name: "", company: "", phone: "", avatar_url: "" });
  useEffect(() => {
    if (data) setForm({ full_name: data.full_name ?? "", company: data.company ?? "", phone: data.phone ?? "", avatar_url: data.avatar_url ?? "" });
  }, [data]);

  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, email: user.email!, ...form, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    qc.invalidateQueries({ queryKey: ["profile"] });
    await supabase.from("activity_logs").insert({ user_id: user.id, action: "profile.updated", entity: "profile" });
  };

  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your personal account details.</p>
      </div>
      <Card className="rounded-2xl p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
            {(form.full_name || user?.email || "?").slice(0,2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-semibold">{form.full_name || "Unnamed user"}</div>
            <div className="truncate text-sm text-muted-foreground">{user?.email}</div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div><Label>Full name</Label><Input className="mt-1.5" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
          <div><Label>Company</Label><Input className="mt-1.5" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
          <div><Label>Phone</Label><Input className="mt-1.5" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label>Avatar URL</Label><Input className="mt-1.5" value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} /></div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={save} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save changes</Button>
        </div>
      </Card>
    </div>
  );
}
