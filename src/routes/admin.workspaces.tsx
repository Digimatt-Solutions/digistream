import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/admin/workspaces")({
  component: () => (
    <ModulePlaceholder
      title="Client Workspaces"
      description="Provision and configure isolated tenant workspaces."
      highlights={["Custom domains","Theme & branding","Feature flags","Workspace clone"]}
    />
  ),
});
