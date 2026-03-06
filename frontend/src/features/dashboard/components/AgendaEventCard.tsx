/**
 * ===================================================================
 * COMPONENTE: AgendaEventCard
 * ===================================================================
 * Tarjeta individual que muestra toda la información de un evento
 * en la agenda del día.
 * ===================================================================
 */

import type { Event } from '@/models/event';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Eye, Wrench, Lock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EventTimelineBadge } from './EventTimelineBadge';
import { EventStatusBadge } from './EventStatusBadge';
import { EventConformityCheck } from './EventConformityCheck';
import { Priority } from '@/services/api/types/backend.types';

interface AgendaEventCardProps {
  event: Event;
}

export function AgendaEventCard({ event }: AgendaEventCardProps) {
  const navigate = useNavigate();

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Línea superior: Hora + Nombre + Estado */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <EventTimelineBadge 
            from={event.scheduleFrom} 
            to={event.scheduleTo} 
          />
          <h3 className="text-base font-semibold text-slate-800 mt-1.5">
            {event.name}
          </h3>
        </div>
        <EventStatusBadge status={event.status} />
      </div>

      {/* Ubicación */}
      <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
        <MapPin className="h-4 w-4" />
        <span>
          {event.space?.name || event.freeLocation || 'Sin ubicación definida'}
        </span>
      </div>

      {/* Departamento con color */}
      {event.department && (
        <div className="mb-3">
          <Badge
            style={{
              backgroundColor: event.department.colorHex + '20',
              color: event.department.colorHex,
              borderColor: event.department.colorHex,
            }}
            variant="outline"
            className="text-xs"
          >
            {event.department.name}
          </Badge>
        </div>
      )}

      {/* Badges de flags especiales */}
      <div className="flex flex-wrap gap-2 mb-3">
        {event.priority === Priority.HIGH && (
          <Badge className="text-xs bg-red-100 text-red-700 border-red-200">
            ⭐ Prioridad Alta
          </Badge>
        )}

        {event.requiresTech && (
          <Badge className="text-xs bg-slate-100 text-slate-700 border-slate-200">
            <Wrench className="h-3 w-3 mr-1" />
            Requiere Técnica
          </Badge>
        )}

        {event.internal && (
          <Badge variant="outline" className="text-xs">
            <Lock className="h-3 w-3 mr-1" />
            Interno
          </Badge>
        )}

        {event.requiresRebooking && (
          <Badge className="text-xs bg-red-100 text-red-700 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Requiere Reprogramación
          </Badge>
        )}
      </div>

      {/* Conformidades + Acción */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex gap-4">
          <EventConformityCheck label="Ceremonial" status={event.ceremonialOk} />
          <EventConformityCheck
            label="Técnica"
            status={event.technicalOk}
            showOnlyIfRequired={event.requiresTech}
          />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/eventos/${event.id}`)}
          className="hover:bg-slate-100"
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver detalle
        </Button>
      </div>
    </article>
  );
}
