import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useSession } from "@/lib/session";
import { PlayerView } from "@/components/player-view";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/player")({
  ssr: false,
  component: PlayerStandalone,
  head: () => ({
    meta: [
      { title: "Player - Digistream" },
      { name: "description", content: "Standalone Digistream player." },
      { name: "theme-color", content: "#0a0a0a" },
    ],
  }),
});

function PlayerStandalone() {
  const { session, loading } = useSession();
  const { setTheme } = useTheme();

  // Default to dark on first player launch, but respect a saved preference otherwise
  useEffect(() => {
    try {
      const saved = localStorage.getItem("digistream-theme");
      const seen = sessionStorage.getItem("digistream-player-opened");
      if (!saved && !seen) {
        setTheme("dark");
      }
      sessionStorage.setItem("digistream-player-opened", "1");
    } catch {
      setTheme("dark");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-64 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl sm:h-16 sm:px-6">
        <div className="flex items-center gap-3">
          <Brand variant="full" size="md" />
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:inline">
            Premium Player
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
        </div>
      </header>
      <main className="relative z-10 mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <PlayerView standalone />
      </main>
    </div>
  );
}
