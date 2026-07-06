import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/client/support")({
  component: () => (
    <ModulePlaceholder
      title="Support"
      description="Direct line to the Digimatt CSM and support team."
      highlights={["Priority ticketing","Live chat","SLA visibility","Runbooks & docs"]}
    />
  ),
});
