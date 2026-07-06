import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import type { ReactNode } from "react";

export function ModulePlaceholder({
  title,
  description,
  highlights,
  cta = "Coming in next iteration",
}: {
  title: string;
  description: string;
  highlights: string[];
  cta?: string;
  children?: ReactNode;
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card className="relative overflow-hidden rounded-2xl border-border bg-card p-10 shadow-[var(--shadow-card)]">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-30 blur-3xl" style={{ background: "var(--gradient-primary)" }} />
        <div className="relative max-w-2xl">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">This module is scaffolded and ready to wire.</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            The route, RBAC gate, navigation and layout are all live. Hook it up to Supabase or your CDN/transcoding pipeline whenever you're ready.
          </p>
          <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> {h}
              </li>
            ))}
          </ul>
          <Button className="mt-6 rounded-lg">{cta}</Button>
        </div>
      </Card>
    </>
  );
}
