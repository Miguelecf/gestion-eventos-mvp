import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store';

export function UnauthorizedPage() {
  const roles = useAppStore(state => state.roles);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <ShieldAlert className="w-16 h-16 text-destructive" />
      <h1 className="text-2xl font-bold">Acceso Denegado</h1>
      <p className="text-muted-foreground text-center max-w-md">
        No tienes permisos para acceder a esta página.
        {roles.length > 0 && (
          <span className="block mt-2 text-sm">
            Tu rol actual: <strong>{roles.join(', ')}</strong>
          </span>
        )}
      </p>
      <Button asChild>
        <Link to="/dashboard">Volver al Dashboard</Link>
      </Button>
    </div>
  );
}
