import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/client/settings")({
  component: () => (
    <ModulePlaceholder
      title="Workspace Settings"
      description="Branding, defaults and workspace preferences."
      highlights={["Custom logo & colors","Default playlists","Timezone & locale","Notification preferences"]}
    />
  ),
});
