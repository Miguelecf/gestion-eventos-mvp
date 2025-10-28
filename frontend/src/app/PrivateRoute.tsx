import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store';

export function PrivateRoute() {
  const token = useAppStore(state => state.token);
  const location = useLocation();
  
  if (!token) {
    // Guardar la ruta intentada para redireccionar después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <Outlet />;
}
