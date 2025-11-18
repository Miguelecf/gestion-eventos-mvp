import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';

export function PrivateRoute() {
  const { tokens, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-6">Cargando…</div>;

  if (!tokens?.accessToken) {
    // Guardar la ruta intentada para redireccionar después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
