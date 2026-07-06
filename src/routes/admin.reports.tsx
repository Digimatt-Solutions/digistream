import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/admin/reports")({
  component: () => (
    <ModulePlaceholder
      title="Reports"
      description="Schedule and export operational and financial reports."
      highlights={["CSV / PDF exports","Scheduled deliveries","Custom cohorts","Shareable links"]}
    />
  ),
});
