import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/client/live")({
  component: () => (
    <ModulePlaceholder
      title="Live Channels"
      description="Watch and manage the live streams your subscription includes."
      highlights={["Multi-region ingest","DVR replay","Concurrent viewer counts","Failover streams"]}
    />
  ),
});
