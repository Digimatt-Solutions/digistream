import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Camera, Mail, Phone, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAvatarUrl, uploadAvatar } from "@/lib/avatar";
import { logAction } from "@/lib/activity";
import { format } from "date-fns";

export const Route = createFileRoute("/app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, role } = useSession();
  const qc = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
    enabled: !!user,
  });

  const [form, setForm] = useState({ full_name: "", company: "", phone: "", bio: "" });
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const avatarDisplay = useAvatarUrl(avatarPath);

  useEffect(() => {
    if (data) {
      setForm({ full_name: data.full_name ?? "", company: data.company ?? "", phone: data.phone ?? "", bio: (data as any).bio ?? "" });
      setAvatarPath((data as any).avatar_url ?? null);
    }
  }, [data]);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id, email: user.email!,
      full_name: form.full_name, company: form.company, phone: form.phone,
      bio: form.bio,
      avatar_url: avatarPath,
      updated_at: new Date().toISOString(),
    } as never);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    qc.invalidateQueries({ queryKey: ["profile"] });
    qc.invalidateQueries({ queryKey: ["profile-lite"] });
    logAction(user.id, "profile.updated", "profile");
  };

  const onAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Image too large (max 5 MB)");
    setUploading(true);
    try {
      const path = await uploadAvatar(user.id, file);
      setAvatarPath(path);
      await supabase.from("profiles").upsert({ id: user.id, email: user.email!, avatar_url: path, updated_at: new Date().toISOString() });
      qc.invalidateQueries({ queryKey: ["profile-lite"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Photo updated");
      logAction(user.id, "profile.avatar_uploaded", "profile");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const initials = (form.full_name || user?.email || "?").slice(0, 2).toUpperCase();
  const created = (data as any)?.created_at ? format(new Date((data as any).created_at), "MMM d, yyyy") : "-";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Personalize how you appear across Digistream.</p>
      </div>

      {/* Hero card */}
      <Card className="relative overflow-hidden rounded-3xl p-0 shadow-[var(--shadow-elevated)]">
        <div className="h-24 bg-gradient-to-r from-primary via-primary-glow to-primary sm:h-32" />
        <div className="px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-14 flex flex-col items-center gap-4 text-center md:flex-row md:items-end md:justify-between md:text-left">
            <div className="flex flex-col items-center gap-4 md:flex-row md:items-end md:gap-5">
              <div className="relative">
                {avatarDisplay ? (
                  <img src={avatarDisplay} alt="" className="h-24 w-24 rounded-2xl object-cover ring-4 ring-card shadow-xl sm:h-28 sm:w-28" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-2xl font-bold text-primary-foreground ring-4 ring-card shadow-xl sm:h-28 sm:w-28 sm:text-3xl">
                    {initials}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105"
                  title="Change photo"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </button>
                <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={onAvatarPick} />
              </div>
              <div className="pb-1">
                <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                  <h2 className="text-xl font-bold sm:text-2xl">{form.full_name || "Unnamed user"}</h2>
                  <Badge variant="secondary" className="capitalize"><CheckCircle2 className="mr-1 h-3 w-3 text-success" />{role}</Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground md:justify-start">
                  <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {user?.email}</span>
                  {form.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {form.phone}</span>}
                  {form.company && <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {form.company}</span>}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Member since {created}</div>
              </div>
            </div>
            <Button onClick={save} disabled={saving} size="lg" className="w-full rounded-xl md:w-auto">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save changes
            </Button>
          </div>
        </div>
      </Card>


      <Card className="rounded-2xl p-6 shadow-[var(--shadow-card)]">
        <h3 className="font-semibold">Personal details</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div><Label>Full name</Label><Input className="mt-1.5" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
          <div><Label>Company</Label><Input className="mt-1.5" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
          <div><Label>Phone</Label><Input className="mt-1.5" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254 700 000 000" /></div>
          <div><Label>Email</Label><Input className="mt-1.5" value={user?.email ?? ""} disabled /></div>
          <div className="md:col-span-2"><Label>Bio</Label><Textarea className="mt-1.5" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Tell us about yourself" /></div>
        </div>
      </Card>

      {form.bio && (
        <Card className="rounded-2xl p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold">About</h3>
          <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{form.bio}</p>
        </Card>
      )}
    </div>
  );
}
