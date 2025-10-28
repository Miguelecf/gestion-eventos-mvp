import { Navigate, Outlet } from 'react-router-dom';
import { useCan } from '@/hooks/useCan';
import type { Action, Subject } from '@/libs/ability';

interface RoleRouteProps {
  action: Action;
  subject: Subject;
  fallback?: string;
}

export function RoleRoute({ action, subject, fallback = '/unauthorized' }: RoleRouteProps) {
  const can = useCan();
  
  if (!can(action, subject)) {
    return <Navigate to={fallback} replace />;
  }
  
  return <Outlet />;
}
