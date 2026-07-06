import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/admin/api")({
  component: () => (
    <ModulePlaceholder
      title="API Credentials"
      description="Manage service tokens, webhooks and rate limits per tenant."
      highlights={["Token rotation","Scopes & IP allowlist","Webhook signing keys","Usage analytics"]}
    />
  ),
});
