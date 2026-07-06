import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/admin/monitoring")({
  component: () => (
    <ModulePlaceholder
      title="System Monitoring"
      description="Real-time health of ingestion, delivery and player fleets."
      highlights={["Ingestion queues","CDN edge health","Player heartbeat","Incident timelines"]}
    />
  ),
});
