import { createFileRoute } from "@tanstack/react-router";
import { PlayerView } from "@/components/player-view";

export const Route = createFileRoute("/app/watch")({
  component: () => <PlayerView />,
});
