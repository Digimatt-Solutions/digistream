import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/admin/audit")({
  component: () => (
    <ModulePlaceholder
      title="Audit Logs"
      description="Every mutation, sign-in and permission change — immutable."
      highlights={["Tamper-evident chain","Advanced filters","Retention policy","Compliance exports"]}
    />
  ),
});
