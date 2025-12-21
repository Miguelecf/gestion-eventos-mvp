/**
 * ===================================================================
 * COMPONENTE: TodayAgenda
 * ===================================================================
 * Componente principal de la Agenda del Día.
 * Muestra todos los eventos del día actual ordenados cronológicamente.
 * ===================================================================
 */

import { useTodayEvents } from '../hooks/useTodayEvents';
import { useAgendaFilters } from '../hooks/useAgendaFilters';
import { useFilteredEvents } from '../hooks/useFilteredEvents';
import { AgendaFilters } from './AgendaFilters';
import { AgendaEventCard } from './AgendaEventCard';
import { EmptyAgendaState } from './EmptyAgendaState';
import { AgendaSkeleton } from './AgendaSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, AlertCircle } from 'lucide-react';
import type { Event } from '@/models/event';

/**
 * Ordena eventos por horario de inicio, y luego por espacio
 */
function sortEventsBySchedule(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    // Primario: por hora de inicio
    const timeCompare = a.scheduleFrom.localeCompare(b.scheduleFrom);
    if (timeCompare !== 0) return timeCompare;

    // Secundario: por espacio
    const spaceA = a.space?.name || a.freeLocation || '';
    const spaceB = b.space?.name || b.freeLocation || '';
    return spaceA.localeCompare(spaceB);
  });
}

/**
 * Estado de error con opción de reintentar
 */
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="rounded-2xl border-red-200 bg-red-50 shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-700 mb-1">
          Error al cargar eventos
        </h3>
        <p className="text-sm text-red-600 mb-4 text-center max-w-sm">
          No se pudieron obtener los eventos del día. Por favor, intenta nuevamente.
        </p>
        <Button onClick={onRetry} variant="outline" className="border-red-300 hover:bg-red-100">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </CardContent>
    </Card>
  );
}

export function TodayAgenda() {
  const { data: events, isLoading, error, refetch } = useTodayEvents();
  const { filters } = useAgendaFilters();
  const filteredEvents = useFilteredEvents(events, filters);

  // Estado de carga
  if (isLoading) {
    return <AgendaSkeleton />;
  }

  // Estado de error
  if (error) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  // Ordenar eventos filtrados
  const sortedEvents = sortEventsBySchedule(filteredEvents);
  const totalEvents = events?.length || 0;
  const filteredCount = filteredEvents.length;

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="space-y-0 pb-0">
        <div className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg text-slate-800">Agenda de hoy</CardTitle>
            <CardDescription>
              {filteredCount} de {totalEvents} evento{totalEvents !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="hover:bg-slate-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
        
        {/* Barra de filtros */}
        <AgendaFilters />
      </CardHeader>
      
      <CardContent className="pt-6">
        {/* Estado vacío (sin eventos en general) */}
        {totalEvents === 0 ? (
          <EmptyAgendaState />
        ) : filteredCount === 0 ? (
          /* Mensaje cuando hay eventos pero los filtros no devuelven resultados */
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-slate-600 mb-2">
              No hay eventos que coincidan con los filtros seleccionados
            </p>
            <p className="text-sm text-slate-500">
              Intenta ajustar o limpiar los filtros
            </p>
          </div>
        ) : (
          /* Lista de eventos filtrados */
          <div className="space-y-3">
            {sortedEvents.map((event) => (
              <AgendaEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
