import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/client/api")({
  component: () => (
    <ModulePlaceholder
      title="API Access"
      description="Programmatic access to your workspace with signed tokens."
      highlights={["Personal access tokens","Webhook endpoints","Scoped permissions","Usage dashboards"]}
    />
  ),
});
