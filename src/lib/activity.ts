import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";

const PAGE_LABELS: Record<string, string> = {
  "/app/dashboard": "Dashboard",
  "/app/content": "Content Library",
  "/app/packages": "Packages",
  "/app/users": "Users",
  "/app/billing": "Billing",
  "/app/activity": "Activity Logs",
  "/app/profile": "Profile",
  "/app/settings": "Settings",
  "/app/watch": "Player",
  "/app/subscription": "Subscription",
  "/app/branding": "Branding",
};

export function pageLabel(path: string): string {
  return PAGE_LABELS[path] ?? path;
}

export function logAction(userId: string | undefined, action: string, entity?: string, details?: Record<string, unknown>) {
  if (!userId) return;
  void supabase.from("activity_logs").insert({
    user_id: userId,
    action,
    entity: entity ?? null,
    page: (typeof window !== "undefined" ? window.location.pathname : null),
    details: (details ?? null) as never,
  });
}

export function usePageTracking() {
  const { user } = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!user || !pathname.startsWith("/app")) return;
    const label = pageLabel(pathname);
    void supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "page.view",
      entity: label,
      page: pathname,
    });
  }, [user, pathname]);
}
