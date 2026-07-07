import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Brand } from "@/components/brand";
const AUTH_BG_URL = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2000&q=80";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in - Digistream" },
      { name: "description", content: "Access your Digistream streaming workspace." },
    ],
  }),
});

function AuthPage() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/public/seed-admin").catch(() => {});
  }, []);

  if (!loading && session) return <Navigate to="/app" />;

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    navigate({ to: "/app" });
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/app`, data: { full_name: name } },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created - signing you in");
    const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
    if (!e2) navigate({ to: "/app" });
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left visual - no orange overlay, subtle bottom darkening */}
      <div className="relative hidden overflow-hidden lg:block">
        <img src={AUTH_BG_URL} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold leading-tight drop-shadow-lg">
              Stream what matters, to whoever needs it.
            </h2>
            <p className="mt-4 text-white/95 drop-shadow">
              Digistream powers licensed content distribution - packaged, priced and delivered to the screens your customers subscribe to.
            </p>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <Brand size="lg" />
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-elevated)]">
            <div className="mb-6 flex flex-col items-center">
              <Brand size="lg" />
              <h1 className="mt-3 text-2xl font-semibold">Digistream</h1>
              <p className="text-sm text-muted-foreground">Streaming content platform</p>
            </div>

            <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={signIn} className="mt-6 space-y-4">
                  <Field icon={<Mail className="h-4 w-4" />} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
                  <PasswordField label="Password" value={password} onChange={setPassword} show={show} setShow={setShow} />
                  <Button type="submit" disabled={busy} className="w-full rounded-lg text-base font-semibold shadow-[var(--shadow-glow)]" size="lg">
                    {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={signUp} className="mt-6 space-y-4">
                  <div>
                    <Label>Full name</Label>
                    <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Jane Doe" />
                  </div>
                  <Field icon={<Mail className="h-4 w-4" />} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
                  <PasswordField label="Password" value={password} onChange={setPassword} show={show} setShow={setShow} />
                  <Button type="submit" disabled={busy} className="w-full rounded-lg text-base font-semibold" size="lg">
                    {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Account
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    New accounts start as <strong>Client</strong>. Admin credentials are provisioned separately.
                  </p>
                </form>
              </TabsContent>
            </Tabs>

            <p className="mt-6 text-center text-xs text-muted-foreground">© Powered by Digimatt Solutions</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, type, value, onChange, placeholder }: { icon: React.ReactNode; label: string; type: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">{icon}</span>
        <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} required placeholder={placeholder} className="pl-9" />
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, setShow }: { label: string; value: string; onChange: (v: string) => void; show: boolean; setShow: (v: boolean) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground"><Lock className="h-4 w-4" /></span>
        <Input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} required placeholder="••••••••" className="pl-9 pr-10" />
        <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
