import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard, Film, FolderTree, ListVideo, Radio, CalendarClock,
  Building2, Layers, Package, CreditCard, MonitorPlay, BarChart3, FileBarChart,
  Users, ShieldCheck, KeyRound, ScrollText, Bell, Settings, Activity,
} from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";
import { useAuth } from "@/lib/auth";
import { useRouterState } from "@tanstack/react-router";

const NAV: NavItem[] = [
  { group: "Overview", label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { group: "Content", label: "Content Library", to: "/admin/content", icon: Film },
  { group: "Content", label: "Categories", to: "/admin/categories", icon: FolderTree },
  { group: "Content", label: "Playlists", to: "/admin/playlists", icon: ListVideo },
  { group: "Content", label: "Live Streams", to: "/admin/live", icon: Radio },
  { group: "Content", label: "Scheduling", to: "/admin/scheduling", icon: CalendarClock },
  { group: "Clients", label: "Clients", to: "/admin/clients", icon: Building2 },
  { group: "Clients", label: "Workspaces", to: "/admin/workspaces", icon: Layers },
  { group: "Billing", label: "Packages", to: "/admin/packages", icon: Package },
  { group: "Billing", label: "Billing", to: "/admin/billing", icon: CreditCard },
  { group: "Fleet", label: "Devices", to: "/admin/devices", icon: MonitorPlay },
  { group: "Fleet", label: "System Monitor", to: "/admin/monitoring", icon: Activity },
  { group: "Insights", label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
  { group: "Insights", label: "Reports", to: "/admin/reports", icon: FileBarChart },
  { group: "Access", label: "Users", to: "/admin/users", icon: Users },
  { group: "Access", label: "Roles", to: "/admin/roles", icon: ShieldCheck },
  { group: "Access", label: "API Credentials", to: "/admin/api", icon: KeyRound },
  { group: "System", label: "Audit Logs", to: "/admin/audit", icon: ScrollText },
  { group: "System", label: "Notifications", to: "/admin/notifications", icon: Bell },
  { group: "System", label: "Settings", to: "/admin/settings", icon: Settings },
];

const TITLES: Record<string, string> = {
  "/admin": "Platform Overview",
  "/admin/content": "Content Library",
  "/admin/categories": "Categories",
  "/admin/playlists": "Playlists",
  "/admin/live": "Live Streams",
  "/admin/scheduling": "Content Scheduling",
  "/admin/clients": "Clients",
  "/admin/workspaces": "Client Workspaces",
  "/admin/packages": "Subscription Packages",
  "/admin/billing": "Billing",
  "/admin/devices": "Device Fleet",
  "/admin/monitoring": "System Monitoring",
  "/admin/analytics": "Analytics",
  "/admin/reports": "Reports",
  "/admin/users": "Users",
  "/admin/roles": "Roles & Permissions",
  "/admin/api": "API Credentials",
  "/admin/audit": "Audit Logs",
  "/admin/notifications": "Notifications",
  "/admin/settings": "Settings",
};

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (typeof window !== "undefined" && (!user || (user.role !== "super_admin" && user.role !== "content_manager"))) {
    if (!user) {
      window.location.href = "/";
      return null;
    }
    // Client roles are redirected to their portal
    window.location.href = "/client";
    return null;
  }

  const title = TITLES[pathname] ?? "Digimatt Admin";
  return (
    <AppShell nav={NAV} title={title} portalLabel="Admin Portal">
      <Outlet />
    </AppShell>
  );
}
