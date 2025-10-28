/**
 * ===================================================================
 * HOOK DE EVENTOS DEL CALENDARIO
 * ===================================================================
 * Custom hook que encapsula la lógica de carga y gestión de eventos
 * del calendario, siguiendo la arquitectura del proyecto
 * ===================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store';
import type { Event } from '@/models/event';
import { loadCalendarEvents } from '../services/calendar.service';

/**
 * Estado del hook
 */
interface UseCalendarEventsState {
  events: Event[];
  loading: boolean;
  error: Error | null;
}

/**
 * Valor de retorno del hook
 */
interface UseCalendarEventsReturn extends UseCalendarEventsState {
  refetch: () => Promise<void>;
}

/**
 * Custom hook para gestionar eventos del calendario
 * 
 * @returns Estado y funciones para gestionar eventos
 * 
 * @example
 * function CalendarPage() {
 *   const { events, loading, error, refetch } = useCalendarEvents();
 *   
 *   if (loading) return <Loader />;
 *   if (error) return <Error message={error.message} />;
 *   
 *   return <Calendar events={events} />;
 * }
 */
export function useCalendarEvents(): UseCalendarEventsReturn {
  const [state, setState] = useState<UseCalendarEventsState>({
    events: [],
    loading: false,
    error: null
  });

  // Seleccionar datos del store
  const dateRangeStart = useAppStore(state => state.dateRange.start);
  const dateRangeEnd = useAppStore(state => state.dateRange.end);

  /**
   * Carga eventos del calendario
   */
  const fetchEvents = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await loadCalendarEvents({
        startDate: dateRangeStart,
        endDate: dateRangeEnd
      });

      setState({
        events: result.events,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading calendar events:', error);
      setState({
        events: [],
        loading: false,
        error: error instanceof Error ? error : new Error('Error desconocido')
      });
    }
  }, [dateRangeStart, dateRangeEnd]);

  /**
   * Cargar eventos cuando cambie el rango
   */
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    ...state,
    refetch: fetchEvents
  };
}
