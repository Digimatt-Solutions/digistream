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

// Very lightweight UA parsing - no external deps
export function parseUA(ua: string): { device: string; browser: string; os: string } {
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  const isTablet = /Tablet|iPad/i.test(ua);
  const device = isTablet ? "Tablet" : isMobile ? "Mobile" : "Desktop";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Other";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Mac OS X/.test(ua)
      ? "macOS"
      : /Android/.test(ua)
        ? "Android"
        : /iPhone|iPad|iPod/.test(ua)
          ? "iOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "Other";
  return { device, browser, os };
}

// Simple in-browser country guess from timezone
export function guessCountry(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const map: Record<string, string> = {
      "Africa/Nairobi": "Kenya",
      "Africa/Dar_es_Salaam": "Tanzania",
      "Africa/Kampala": "Uganda",
      "Africa/Lagos": "Nigeria",
      "Africa/Johannesburg": "South Africa",
      "Africa/Cairo": "Egypt",
      "Europe/London": "United Kingdom",
      "Europe/Berlin": "Germany",
      "Europe/Paris": "France",
      "America/New_York": "United States",
      "America/Los_Angeles": "United States",
      "America/Chicago": "United States",
      "Asia/Dubai": "UAE",
      "Asia/Kolkata": "India",
      "Asia/Tokyo": "Japan",
    };
    return map[tz] ?? tz.split("/")[0] ?? "Unknown";
  } catch {
    return "Unknown";
  }
}

function trafficContext() {
  if (typeof navigator === "undefined") return {};
  const ua = navigator.userAgent;
  return { user_agent: ua, ...parseUA(ua), country: guessCountry() };
}

export function logAction(
  userId: string | undefined,
  action: string,
  entity?: string,
  details?: Record<string, unknown>,
) {
  if (!userId) return;
  void supabase.from("activity_logs").insert({
    user_id: userId,
    action,
    entity: entity ?? null,
    page: typeof window !== "undefined" ? window.location.pathname : null,
    details: (details ?? null) as never,
    ...trafficContext(),
  } as never);
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
      ...trafficContext(),
    } as never);
  }, [user, pathname]);
}
