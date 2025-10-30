// src/features/auth/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthApi } from "./api";
import { getStoredTokens, setStoredTokens, type Tokens } from "../../lib/http";
import type { LoginRequest, RegisterRequest, UserSummary } from "./types";

export type AuthContextType = {
  user: UserSummary | null;
  tokens: Tokens | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  me: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

// Hook seguro que garantiza no-null
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(getStoredTokens());
  const [loading, setLoading] = useState(true);

  // Función auxiliar para setear tokens y traer el usuario
  const setTokensAndUser = async (t: Tokens) => {
    setStoredTokens(t);
    setTokens(t);
    const u = await AuthApi.me();
    setUser(u);
  };

  // Refresh interno reutilizable (sin tocar loading)
  const refreshInternal = async () => {
    if (!tokens?.refreshToken) return;
    const res = await AuthApi.refresh({ refreshToken: tokens.refreshToken });
    const t: Tokens = {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      expiresAt: res.expiresAt,
    };
    await setTokensAndUser(t);
  };

  // Boot inicial: valida sesión y, si hace falta, refresca
  useEffect(() => {
    (async () => {
      try {
        if (tokens?.accessToken) {
          const now = Date.now();
          const exp =
            typeof tokens.expiresAt === "number"
              ? tokens.expiresAt
              : new Date(tokens.expiresAt as unknown as string).getTime();

          // Si expira en < 60s y hay refresh, refrescamos primero
          if (exp && exp - now < 60_000 && tokens.refreshToken) {
            await refreshInternal();
          } else {
            const u = await AuthApi.me();
            setUser(u);
          }
        }
      } catch {
        setStoredTokens(null);
        setTokens(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // solo una vez al montar

  const login = async (data: LoginRequest) => {
    setLoading(true);
    try {
      const res = await AuthApi.login(data);
      const t: Tokens = {
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        expiresAt: res.expiresAt,
      };
      await setTokensAndUser(t);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setLoading(true);
    try {
      await AuthApi.register(data); // backend no devuelve tokens
      setStoredTokens(null);
      setTokens(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (tokens?.refreshToken) {
        await AuthApi.logout(tokens.refreshToken);
      }
    } finally {
      setStoredTokens(null);
      setTokens(null);
      setUser(null);
      setLoading(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    try {
      await refreshInternal();
    } finally {
      setLoading(false);
    }
  };

  const me = async () => {
    if (!tokens?.accessToken) return;
    setLoading(true);
    try {
      const u = await AuthApi.me();
      setUser(u);
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      tokens,
      loading,
      login,
      register,
      logout,
      refresh,
      me,
    }),
    [user, tokens, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
