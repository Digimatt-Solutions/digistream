import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Users, Activity, CreditCard, Film, Package, User, Settings,
  Menu, Bell, LogOut, ChevronDown, PlayCircle, Palette, Sparkles,
} from "lucide-react";
import { useSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAvatarUrl } from "@/lib/avatar";
import { usePageTracking } from "@/lib/activity";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

interface NavItem { label: string; to: string; icon: LucideIcon }

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", to: "/app/dashboard", icon: LayoutDashboard },
  { label: "Content", to: "/app/content", icon: Film },
  { label: "Packages", to: "/app/packages", icon: Package },
  { label: "Users", to: "/app/users", icon: Users },
  { label: "Billing", to: "/app/billing", icon: CreditCard },
  { label: "Activity Logs", to: "/app/activity", icon: Activity },
  { label: "Profile", to: "/app/profile", icon: User },
  { label: "Settings", to: "/app/settings", icon: Settings },
];

const CLIENT_NAV: NavItem[] = [
  { label: "Dashboard", to: "/app/dashboard", icon: LayoutDashboard },
  { label: "Player", to: "/app/watch", icon: PlayCircle },
  { label: "Subscription", to: "/app/subscription", icon: Sparkles },
  { label: "Branding", to: "/app/branding", icon: Palette },
  { label: "Profile", to: "/app/profile", icon: User },
  { label: "Settings", to: "/app/settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, role, signOut } = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  usePageTracking();

  const { data: profile } = useQuery({
    queryKey: ["profile-lite", user?.id],
    queryFn: async () => (await supabase.from("profiles").select("full_name, avatar_url").eq("id", user!.id).maybeSingle()).data,
    enabled: !!user,
  });
  const avatarUrl = useAvatarUrl(profile?.avatar_url);

  const nav = role === "admin" ? ADMIN_NAV : CLIENT_NAV;
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Account";
  const initials = displayName.split(" ").map((s: string) => s[0]).slice(0, 2).join("").toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  const SidebarBody = ({ compact = false }: { compact?: boolean }) => (
    <div className="flex h-full flex-col bg-sidebar">
      <div className={cn("flex h-16 items-center border-b border-sidebar-border", compact ? "justify-center" : "px-5")}>
        {compact ? <Brand showText={false} size="sm" /> : <Brand />}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.map((item) => {
          const active = pathname === item.to || (item.to !== "/app/dashboard" && pathname.startsWith(item.to));
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                compact && "justify-center px-2",
                active
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
              {!compact && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={handleSignOut}
        className={cn(
          "m-3 flex items-center gap-2 rounded-lg border border-sidebar-border px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground",
          compact && "justify-center px-2",
        )}
      >
        <LogOut className="h-4 w-4" />
        {!compact && <span>Logout</span>}
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={cn("hidden shrink-0 border-r border-sidebar-border transition-all lg:block", collapsed ? "w-16" : "w-64")}>
        <SidebarBody compact={collapsed} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only"><SheetTitle>Navigation</SheetTitle></SheetHeader>
          <SidebarBody />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={() => setCollapsed(!collapsed)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-muted-foreground">
              Welcome, <span className="font-semibold text-foreground">{displayName}</span>
            </p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-lg">
            <Bell className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-full border border-border bg-card p-1 pr-3 shadow-sm transition hover:border-primary/40 hover:shadow-md">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-sm font-bold text-primary-foreground ring-2 ring-primary/20">
                    {initials}
                  </div>
                )}
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-semibold leading-tight">{displayName}</div>
                  <div className="text-[11px] capitalize text-muted-foreground">{role ?? "…"}</div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="font-medium">{displayName}</div>
                <div className="text-xs font-normal text-muted-foreground">{user?.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/app/profile" })}>
                <User className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/app/settings" })}>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
