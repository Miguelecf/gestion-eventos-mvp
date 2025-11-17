import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthApi } from "./api";
import { getStoredTokens, setStoredTokens, clearStoredTokens, type Tokens } from "../../lib/http";
import type { LoginRequest, RegisterRequest, UserSummary } from "./types";
import { useAppStore } from "@/store";

export type AuthContextType = {
  user: UserSummary | null;
  tokens: Tokens | null;
  loading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  me: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [authTokens, setAuthTokens] = useState<Tokens | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Conectar con el store global
  const setAuth = useAppStore((state) => state.setAuth);
  const clearAuth = useAppStore((state) => state.clearAuth);

  useEffect(() => {
    // Al iniciar la app: intenta restaurar sesión desde tokens guardados
    (async () => {
      try {
        const stored = getStoredTokens();
        if (stored?.accessToken) {
          setAuthTokens(stored);
          const user = await AuthApi.me();
          setCurrentUser(user);
          // ✅ Sincronizar con store global
          setAuth(stored.accessToken, user.id.toString(), [`ROLE_${user.role}`]);
        }
      } catch {
        clearStoredTokens();
        setAuthTokens(null);
        clearAuth();
      } finally {
        setIsAuthLoading(false);
      }
    })();

    // Escucha cambios en localStorage desde otras pestañas (sincroniza sesión)
    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === null || e.key === "auth.tokens") {
        const stored = getStoredTokens();
        if (!stored) {
          setCurrentUser(null);
          setAuthTokens(null);
        } else {
          setAuthTokens(stored);
        }
      }
    };

    window.addEventListener("storage", handleStorageSync);
    return () => window.removeEventListener("storage", handleStorageSync);
  }, [setAuth, clearAuth]);

  const login = async (payload: LoginRequest) => {
    const response = await AuthApi.login(payload);
    const nextTokens: Tokens = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresIn: response.expiresIn,
    };
    setStoredTokens(nextTokens);
    setAuthTokens(nextTokens);

    const fetchedUser = await AuthApi.me();
    setCurrentUser(fetchedUser);

    // ✅ Sincronizar con store global
    setAuth(nextTokens.accessToken, fetchedUser.id.toString(), [`ROLE_${fetchedUser.role}`]);
  };

  const register = async (payload: RegisterRequest) => {
    await AuthApi.register(payload);
    setStoredTokens(null);
    setAuthTokens(null);
    setCurrentUser(null);
  };

  const logout = async () => {
    setIsAuthLoading(true);
    try {
      if (authTokens?.refreshToken) {
        try {
          await AuthApi.logout(authTokens.refreshToken);
        } catch (err) {
          console.warn("Logout request failed (ignored):", err);
        }
      } else {
        try {
          await AuthApi.logout();
        } catch {}
      }
    } finally {
      // Limpia todo: tokens, usuario, localStorage
      clearStoredTokens();
      setAuthTokens(null);
      setCurrentUser(null);
      clearAuth(); // ✅ Limpiar store global
      setIsAuthLoading(false);
    }
  };

  const refresh = async () => {
    if (!authTokens?.refreshToken) return;
    const response = await AuthApi.refresh({ refreshToken: authTokens.refreshToken });
    const nextTokens: Tokens = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresIn: response.expiresIn,
    };
    setStoredTokens(nextTokens);
    setAuthTokens(nextTokens);
    const fetchedUser = await AuthApi.me();
    setCurrentUser(fetchedUser);
  };

  const me = async () => {
    if (!authTokens?.accessToken) return;
    const fetchedUser = await AuthApi.me();
    setCurrentUser(fetchedUser);
  };

  // Mantenemos las claves expuestas: user, tokens, loading
  const value = useMemo(
    () => ({
      user: currentUser,
      tokens: authTokens,
      loading: isAuthLoading,
      login,
      register,
      logout,
      refresh,
      me,
    }),
    [currentUser, authTokens, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthContext };
