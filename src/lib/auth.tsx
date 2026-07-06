import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { USERS, type Role, type User } from "./mock-data";

interface AuthCtx {
  user: User | null;
  setUser: (u: User) => void;
  signOut: () => void;
  can: (roles: Role[]) => boolean;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "digimatt.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
      if (raw) setUserState(JSON.parse(raw));
    } catch {}
  }, []);

  const setUser = (u: User) => {
    setUserState(u);
    try { window.localStorage.setItem(KEY, JSON.stringify(u)); } catch {}
  };
  const signOut = () => {
    setUserState(null);
    try { window.localStorage.removeItem(KEY); } catch {}
  };
  const can = (roles: Role[]) => !!user && roles.includes(user.role);

  return <Ctx.Provider value={{ user, setUser, signOut, can }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}

export { USERS };
