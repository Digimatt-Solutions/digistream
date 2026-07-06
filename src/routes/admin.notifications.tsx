import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/admin/notifications")({
  component: () => (
    <ModulePlaceholder
      title="Notifications"
      description="Configure alert channels for platform and tenant events."
      highlights={["Email · Slack · Webhook","Severity routing","Digest windows","Per-tenant overrides"]}
    />
  ),
});
