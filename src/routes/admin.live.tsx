import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/admin/live")({
  component: () => (
    <ModulePlaceholder
      title="Live Streams"
      description="Manage RTMP endpoints, live channels and DVR windows."
      highlights={["Live channel encoder keys","Automatic failover","DVR replay windows","Concurrent viewer stats"]}
    />
  ),
});
