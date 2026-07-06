import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Platform-wide configuration and defaults." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold">Organization</h3>
          <p className="mt-1 text-xs text-muted-foreground">These details appear on invoices and portal branding.</p>
          <div className="mt-5 space-y-4">
            <div><Label>Company name</Label><Input defaultValue="Digimatt Media Group" className="mt-1.5 rounded-lg" /></div>
            <div><Label>Support email</Label><Input defaultValue="support@digimatt.io" className="mt-1.5 rounded-lg" /></div>
            <div><Label>Default region</Label><Input defaultValue="Global (multi-region CDN)" className="mt-1.5 rounded-lg" /></div>
          </div>
        </Card>
        <Card className="rounded-2xl border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold">Platform preferences</h3>
          <p className="mt-1 text-xs text-muted-foreground">Toggles that affect every tenant unless overridden.</p>
          <div className="mt-5 space-y-4">
            {[
              ["Enforce SSO for admin users", true],
              ["Auto-suspend devices offline > 30 days", true],
              ["Send weekly analytics digests", false],
              ["Allow client-side content uploads", false],
            ].map(([label, on]) => (
              <div key={label as string} className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-3">
                <span className="text-sm">{label}</span>
                <Switch defaultChecked={on as boolean} />
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-6 flex justify-end">
        <Button className="rounded-lg" onClick={() => toast.success("Settings saved")}>Save changes</Button>
      </div>
    </>
  );
}
