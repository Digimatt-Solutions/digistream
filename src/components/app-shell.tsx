import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Bell, LogOut, Search, ChevronDown } from "lucide-react";
import { type ReactNode } from "react";
import { Brand } from "./brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { ROLES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  group?: string;
}

export function AppShell({
  nav,
  title,
  portalLabel,
  children,
}: {
  nav: NavItem[];
  title: string;
  portalLabel: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const groups = nav.reduce<Record<string, NavItem[]>>((acc, item) => {
    const g = item.group ?? "Main";
    (acc[g] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Brand />
        </div>
        <div className="px-3 py-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-primary">
            {portalLabel}
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-6">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className="mt-4">
              <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {group}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = pathname === item.to || (item.to !== "/admin" && item.to !== "/client" && pathname.startsWith(item.to));
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition",
                          active
                            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                            : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                        )}
                      >
                        <Icon className={cn("h-4 w-4", active && "text-primary")} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur lg:px-8">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-semibold text-foreground">{title}</h1>
            <p className="truncate text-xs text-muted-foreground">
              {user ? `${user.name} · ${ROLES[user.role].label}` : "Not signed in"}
            </p>
          </div>
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search content, clients, devices…" className="h-9 w-72 rounded-lg border-border bg-secondary pl-9" />
          </div>
          <Button variant="ghost" size="icon" className="rounded-lg">
            <Bell className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 rounded-lg px-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {user?.name.split(" ").map(n => n[0]).slice(0,2).join("") ?? "?"}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="font-medium">{user?.name}</div>
                <div className="text-xs font-normal text-muted-foreground">{user?.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/" })}>Switch role</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { signOut(); navigate({ to: "/" }); }}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
