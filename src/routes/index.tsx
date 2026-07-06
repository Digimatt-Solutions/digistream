import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, Check, PlayCircle, ShieldCheck, Zap } from "lucide-react";
import { Brand } from "@/components/brand";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth, USERS } from "@/lib/auth";
import { ROLES } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate({ to: user.role === "super_admin" || user.role === "content_manager" ? "/admin" : "/client" });
    }
  }, [user, navigate]);

  const signInAs = (u: typeof USERS[number]) => {
    setUser(u);
    toast.success(`Signed in as ${u.name}`, { description: ROLES[u.role].label });
    navigate({ to: u.role === "super_admin" || u.role === "content_manager" ? "/admin" : "/client" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Brand />
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#platform" className="hover:text-foreground">Platform</a>
          <a href="#roles" className="hover:text-foreground">Roles</a>
          <a href="#signin" className="hover:text-foreground">Sign in</a>
        </nav>
        <Button asChild size="sm" className="rounded-lg">
          <a href="#signin">Get started <ArrowRight className="ml-1 h-4 w-4" /></a>
        </Button>
      </header>

      <section className="relative overflow-hidden px-6 pb-16 pt-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-[var(--shadow-card)]">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Multi-tenant · Content · Devices · Analytics
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Enterprise streaming
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                infrastructure, unified.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
              Digimatt is the control plane for distributing licensed content to clients, screens, and player devices around the world — with granular RBAC, subscriptions, and real-time analytics.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl shadow-[var(--shadow-glow)]">
                <a href="#signin">Enter platform</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <a href="#platform">Explore features</a>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto mt-14 max-w-5xl">
            <div
              className="absolute inset-0 -z-10 rounded-3xl opacity-40 blur-3xl"
              style={{ background: "var(--gradient-primary)" }}
            />
            <Card className="overflow-hidden rounded-3xl border-border bg-card p-2 shadow-[var(--shadow-elevated)]">
              <div className="rounded-2xl bg-secondary p-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { l: "Tenants", v: "142", icon: ShieldCheck },
                    { l: "Devices online", v: "8,412", icon: Zap },
                    { l: "Hours streamed", v: "312K", icon: PlayCircle },
                    { l: "MRR", v: "$182K", icon: ArrowRight },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl bg-card p-4 shadow-[var(--shadow-card)]">
                      <div className="text-xs text-muted-foreground">{s.l}</div>
                      <div className="mt-1 text-2xl font-semibold">{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section id="signin" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Sign in as any role</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore the platform with one click. RBAC is enforced across routes, menus and records.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {USERS.map((u) => (
            <Card key={u.id} className="group flex flex-col justify-between rounded-2xl border-border bg-card p-5 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-elevated)]">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                    {u.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{u.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="inline-flex rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-medium text-primary">
                    {ROLES[u.role].label}
                  </span>
                  <p className="mt-2 text-xs text-muted-foreground">{ROLES[u.role].description}</p>
                </div>
              </div>
              <Button className="mt-5 w-full rounded-lg" onClick={() => signInAs(u)}>
                Continue as {u.name.split(" ")[0]}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section id="platform" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { t: "Two portals, one platform", d: "Digimatt Admin manages the entire fleet. Clients get isolated, branded workspaces." },
            { t: "RBAC everywhere", d: "Super Admin, Content Manager, Client Admin, Staff and Viewer — enforced end-to-end." },
            { t: "Ready for CDN & payments", d: "Clean service layer waiting for CDN, transcoding, and payment integrations." },
          ].map((f) => (
            <Card key={t.t} className="rounded-2xl border-border p-6 shadow-[var(--shadow-card)]">
              <Check className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
