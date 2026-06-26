import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthCtx = createContext<AuthState | null>(null);
const STORAGE_KEY = "eag.auth.v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user);
        setAccessToken(parsed.accessToken);
      }
    } catch {
      /* noop */
    }
  }, []);

  const login = async (email: string, _password: string) => {
    // VITE_API_BASE_URL unset → proxy mode (same-origin, use Vite proxy)
    // VITE_API_BASE_URL set → direct to that URL
    // VITE_API_BASE_URL=mock → demo login
    const rawBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
    const isMockLogin = rawBase === "mock";
    const base = isMockLogin ? "" : (rawBase?.replace(/\/$/, "") ?? "");
    let nextUser: User;
    let token: string;
    if (!isMockLogin) {
      const res = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: _password }),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      token = data.access_token;
      const me = await fetch(`${base}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      nextUser = await me.json();
    } else {
      await new Promise((r) => setTimeout(r, 450));
      token = "demo-token";
      nextUser = {
        id: "demo",
        email,
        full_name: email.split("@")[0] || "Admin",
        role: "admin",
      };
    }
    setUser(nextUser);
    setAccessToken(token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, accessToken: token }));
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthCtx.Provider
      value={{ user, accessToken, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
