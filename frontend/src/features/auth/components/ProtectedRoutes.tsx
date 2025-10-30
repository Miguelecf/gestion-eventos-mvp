// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthProvider";

export default function ProtectedRoute() {
  const { tokens, loading } = useAuth();

  if (loading) return <div className="p-6">Cargando…</div>;
  return tokens?.accessToken ? <Outlet /> : <Navigate to="/login" replace />;
}
