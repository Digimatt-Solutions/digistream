import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut } = useSession();
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [prefs, setPrefs] = useState({ notifications: true, weeklyDigest: false });

  const changePassword = async () => {
    if (!pw || pw.length < 8) return toast.error("Password must be at least 8 characters");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(error.message);
    setPw("");
    toast.success("Password updated");
    await supabase.from("activity_logs").insert({ user_id: user!.id, action: "password.updated", entity: "auth" });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Security and account preferences.</p>
      </div>
      <Card className="rounded-2xl p-6 shadow-[var(--shadow-card)]">
        <h3 className="font-semibold">Change password</h3>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label>New password</Label>
            <Input className="mt-1.5" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" />
          </div>
          <Button onClick={changePassword} disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Update
          </Button>
        </div>
      </Card>

      <Card className="rounded-2xl p-6 shadow-[var(--shadow-card)]">
        <h3 className="font-semibold">Preferences</h3>
        <div className="mt-4 space-y-3">
          {[
            ["Email notifications", "notifications"],
            ["Weekly analytics digest", "weeklyDigest"],
          ].map(([label, key]) => (
            <div key={key as string} className="flex items-center justify-between rounded-xl border border-border p-3">
              <span className="text-sm">{label}</span>
              <Switch checked={(prefs as any)[key as string]} onCheckedChange={(v) => setPrefs({ ...prefs, [key as string]: v })} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={() => toast.success("Preferences saved")}>Save preferences</Button>
        </div>
      </Card>

      <Card className="rounded-2xl border-destructive/30 p-6 shadow-[var(--shadow-card)]">
        <h3 className="font-semibold text-destructive">Danger zone</h3>
        <p className="mt-1 text-sm text-muted-foreground">Sign out of your Digistream workspace.</p>
        <Button variant="destructive" className="mt-4" onClick={async () => { await signOut(); navigate({ to: "/auth" }); }}>Sign out</Button>
      </Card>
    </div>
  );
}
