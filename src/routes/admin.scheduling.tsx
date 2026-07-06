import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/admin/scheduling")({
  component: () => (
    <ModulePlaceholder
      title="Content Scheduling"
      description="Plan releases, embargoes and rotation windows across regions."
      highlights={["Release calendar","Regional embargoes","Auto rotation","Approval workflow"]}
    />
  ),
});
