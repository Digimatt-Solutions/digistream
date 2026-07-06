import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Film, ListVideo, Radio, MonitorPlay, BarChart3,
  Users, CreditCard, KeyRound, Receipt, LifeBuoy, Settings,
} from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";
import { useAuth } from "@/lib/auth";
import { CLIENTS } from "@/lib/mock-data";

const NAV: NavItem[] = [
  { group: "Overview", label: "Dashboard", to: "/client", icon: LayoutDashboard },
  { group: "Content", label: "Catalogue", to: "/client/catalogue", icon: Film },
  { group: "Content", label: "My Playlists", to: "/client/playlists", icon: ListVideo },
  { group: "Content", label: "Live Channels", to: "/client/live", icon: Radio },
  { group: "Fleet", label: "My Devices", to: "/client/devices", icon: MonitorPlay },
  { group: "Fleet", label: "Analytics", to: "/client/analytics", icon: BarChart3 },
  { group: "Workspace", label: "Team Members", to: "/client/team", icon: Users },
  { group: "Workspace", label: "Subscription", to: "/client/subscription", icon: CreditCard },
  { group: "Workspace", label: "API Access", to: "/client/api", icon: KeyRound },
  { group: "Workspace", label: "Billing History", to: "/client/billing", icon: Receipt },
  { group: "Help", label: "Support", to: "/client/support", icon: LifeBuoy },
  { group: "Help", label: "Settings", to: "/client/settings", icon: Settings },
];

const TITLES: Record<string, string> = {
  "/client": "Workspace Overview",
  "/client/catalogue": "Content Catalogue",
  "/client/playlists": "My Playlists",
  "/client/live": "Live Channels",
  "/client/devices": "My Devices",
  "/client/analytics": "Workspace Analytics",
  "/client/team": "Team Members",
  "/client/subscription": "Subscription",
  "/client/api": "API Access",
  "/client/billing": "Billing History",
  "/client/support": "Support",
  "/client/settings": "Workspace Settings",
};

export const Route = createFileRoute("/client")({
  component: ClientLayout,
});

function ClientLayout() {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (typeof window !== "undefined" && !user) {
    window.location.href = "/";
    return null;
  }

  const workspace = user?.clientId ? CLIENTS.find(c => c.id === user.clientId)?.name : undefined;
  const title = TITLES[pathname] ?? "Client Portal";

  return (
    <AppShell nav={NAV} title={title} portalLabel={workspace ?? "Client Portal"}>
      <Outlet />
    </AppShell>
  );
}
