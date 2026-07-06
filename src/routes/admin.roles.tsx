import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/mock-data";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/roles")({
  component: RolesPage,
});

const PERMISSIONS = [
  "Manage content", "Manage clients", "Manage devices", "Manage billing",
  "View analytics", "Manage users", "API access", "View own workspace only",
];

const matrix: Record<string, Record<string, boolean>> = {
  super_admin: Object.fromEntries(PERMISSIONS.map(p => [p, p !== "View own workspace only"])),
  content_manager: { "Manage content": true, "View analytics": true, "Manage clients": false, "Manage devices": true, "Manage billing": false, "Manage users": false, "API access": true, "View own workspace only": false },
  client_admin: { "Manage content": false, "View analytics": true, "Manage clients": false, "Manage devices": true, "Manage billing": true, "Manage users": true, "API access": true, "View own workspace only": true },
  client_staff: { "Manage content": false, "View analytics": true, "Manage clients": false, "Manage devices": true, "Manage billing": false, "Manage users": false, "API access": false, "View own workspace only": true },
  viewer: { "Manage content": false, "View analytics": false, "Manage clients": false, "Manage devices": false, "Manage billing": false, "Manage users": false, "API access": false, "View own workspace only": true },
};

export function RolesPage() {
  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        description="RBAC matrix enforced across every route, menu and record."
        actions={<Button className="rounded-lg"><ShieldCheck className="mr-2 h-4 w-4" />New custom role</Button>}
      />
      <Card className="overflow-hidden rounded-2xl border-border bg-card p-0 shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/60">
                <th className="p-4 text-left font-medium">Permission</th>
                {Object.entries(ROLES).map(([k, r]) => (
                  <th key={k} className="p-4 text-left font-medium">{r.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PERMISSIONS.map((p) => (
                <tr key={p} className="hover:bg-muted/40">
                  <td className="p-4 font-medium">{p}</td>
                  {Object.keys(ROLES).map((k) => (
                    <td key={k} className="p-4">
                      {matrix[k][p] ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">✓</span>
                      ) : (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-muted-foreground">–</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
