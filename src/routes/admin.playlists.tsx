import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/admin/playlists")({
  component: () => (
    <ModulePlaceholder
      title="Playlists"
      description="Curate schedules of licensed content for clients and devices."
      highlights={["Client-scoped playlists","Drag-and-drop ordering","Dayparting rules","Sync to devices"]}
    />
  ),
});
