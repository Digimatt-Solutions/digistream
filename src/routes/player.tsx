import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/session";
import { PlayerView } from "@/components/player-view";
import { Brand } from "@/components/brand";

export const Route = createFileRoute("/player")({
  ssr: false,
  component: PlayerStandalone,
  head: () => ({
    meta: [
      { title: "Player - Digistream" },
      { name: "description", content: "Standalone Digistream player." },
      { name: "theme-color", content: "#f97316" },
    ],
  }),
});

function PlayerStandalone() {
  const { session, loading } = useSession();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!session) return <Navigate to="/auth" />;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur sm:h-16 sm:px-6">
        <Brand variant="full" size="md" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Standalone Player
        </span>
      </header>
      <main className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <PlayerView standalone />
      </main>
    </div>
  );
}
