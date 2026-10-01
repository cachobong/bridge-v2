import type { CurrentUser, Permission, Session } from "@bridge/shared";
import type { Session as SupabaseSession } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";

const ME_KEY = ["auth", "me"] as const;

type AuthStatus = "loading" | "anonymous" | "authenticated" | "error";

interface AuthContextValue {
  status: AuthStatus;
  user: CurrentUser | null;
  error: unknown;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  // Reloads GET /auth/me (for example after the user's own roles change).
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  // undefined = not known yet; null = signed out.
  const [session, setSession] = useState<SupabaseSession | null | undefined>(undefined);

  useEffect(() => {
    // Fires INITIAL_SESSION first, then on sign-in, token refresh and sign-out.
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === "SIGNED_OUT") queryClient.clear();
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  const me = useQuery({
    queryKey: ME_KEY,
    queryFn: () => api<CurrentUser>("/auth/me"),
    enabled: !!session,
  });

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await api<{ session: Session; user: CurrentUser }>("/auth/login", {
        method: "POST",
        body: { username, password },
        auth: false,
      });
      queryClient.setQueryData(ME_KEY, res.user);
      const { error } = await supabase.auth.setSession({
        access_token: res.session.access_token,
        refresh_token: res.session.refresh_token,
      });
      if (error) throw error;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ME_KEY });
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(() => {
    const user = session ? (me.data ?? null) : null;
    let status: AuthStatus;
    if (session === undefined) status = "loading";
    else if (session === null) status = "anonymous";
    else if (me.data) status = "authenticated";
    else if (me.isError) status = "error";
    else status = "loading";
    return {
      status,
      user,
      error: me.error,
      login,
      logout,
      refresh,
      hasPermission: (p) => !!user?.permissions.includes(p),
    };
  }, [session, me.data, me.isError, me.error, login, logout, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
