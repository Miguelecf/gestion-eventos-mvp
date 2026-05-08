/**
 * ===================================================================
 * COMPONENT: QuickActions
 * ===================================================================
 * Panel de accesos rápidos a otras secciones del sistema.
 * ===================================================================
 */

import { QuickActionButton } from './QuickActionButton';
import { List, CalendarDays, MapPin, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useCan } from '@/hooks/useCan';

/**
 * Panel de accesos rápidos
 * 
 * @example
 * ```tsx
 * <QuickActions />
 * ```
 */
export function QuickActions() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const can = useCan();
  const canCreateEvent = can('create', 'Event');
  const canManageCatalogs = can('manageCatalogs', 'Space');

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-slate-800">
          Accesos rápidos
        </CardTitle>
        <CardDescription>
          Navega rápidamente a otras secciones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Ver todos los eventos */}
        <QuickActionButton
          icon={List}
          label="Ver todos los eventos"
          description="Listado completo con búsqueda avanzada"
          href="/events"
          variant="primary"
        />

        {/* Abrir calendario del día */}
        <QuickActionButton
          icon={CalendarDays}
          label="Abrir calendario del día"
          description="Vista de calendario con fecha de hoy"
          href={`/calendar?date=${today}`}
          variant="primary"
        />

        {/* Gestionar espacios - solo admins con manageCatalogs */}
        {canManageCatalogs && (
          <QuickActionButton
            icon={MapPin}
            label="Gestionar espacios"
            description="Catálogo de espacios disponibles"
            href="/catalog/spaces"
            variant="secondary"
          />
        )}

        {/* Nueva solicitud - ruta según permisos */}
        <QuickActionButton
          icon={Plus}
          label="Nueva solicitud"
          description={canCreateEvent ? "Crear un nuevo evento" : "Crear una solicitud pública de evento"}
          href={canCreateEvent ? "/events/new" : "/solicitud"}
          variant="accent"
        />
      </CardContent>
    </Card>
  );
}
