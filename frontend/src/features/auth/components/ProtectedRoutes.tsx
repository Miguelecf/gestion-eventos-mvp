// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthProvider";

export default function ProtectedRoute() {
  const { tokens, loading } = useAuth();

  if (loading) return <div className="p-6">Cargando…</div>;

  // fallback: también permitir si hay token en localStorage (mock login lo pone allí)
  const localAccess = typeof window !== "undefined" ? localStorage.getItem("auth_access_token") : null;
  const isAuthenticated = Boolean(tokens?.accessToken || localAccess);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
