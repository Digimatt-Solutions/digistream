import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/admin/categories")({
  component: () => (
    <ModulePlaceholder
      title="Categories"
      description="Group content into browsable taxonomies used across catalogues and playlists."
      highlights={["Nested categories & tags","Localized labels","Category-level visibility rules","Featured collections"]}
    />
  ),
});
