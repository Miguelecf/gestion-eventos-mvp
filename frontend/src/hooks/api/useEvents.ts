/**
 * ===================================================================
 * USE EVENTS HOOK - Hook personalizado para eventos con SDK
 * ===================================================================
 * Hook que integra eventsApi SDK para gestión de eventos
 * Compatible con React Query/SWR o uso independiente
 * ===================================================================
 */

import { useState, useCallback } from 'react';
import {
  eventsApi,
  type EventsQueryParams,
  type CreateEventInput,
  type UpdateEventInput,
  type ChangeStatusInput,
  handleApiError,
  logError,
  type ApiError as UtilsApiError
} from '@/services/api';
import type { Event } from '@/models/event';
import type { PageResponse } from '@/services/api/types';

// ==================== TIPOS ====================

/**
 * Estado de carga para el hook
 */
interface UseEventsState {
  loading: boolean;
  error: UtilsApiError | null;
}

/**
 * Retorno del hook useEvents
 */
export interface UseEventsReturn {
  // Estado
  loading: boolean;
  error: UtilsApiError | null;
  
  // Acciones
  fetchEvents: (params?: EventsQueryParams) => Promise<PageResponse<Event> | null>;
  fetchEventById: (id: number) => Promise<Event | null>;
  createEvent: (input: CreateEventInput) => Promise<Event | null>;
  updateEvent: (id: number, input: UpdateEventInput) => Promise<Event | null>;
  deleteEvent: (id: number) => Promise<boolean>;
  changeEventStatus: (eventId: number, input: ChangeStatusInput) => Promise<boolean>;
  clearError: () => void;
}

// ==================== HOOK ====================

/**
 * Hook personalizado para gestión de eventos
 * 
 * @example
 * ```tsx
 * function EventsList() {
 *   const { loading, error, fetchEvents } = useEvents();
 *   const [events, setEvents] = useState<Event[]>([]);
 * 
 *   useEffect(() => {
 *     fetchEvents({ page: 0, size: 20 }).then(result => {
 *       if (result) setEvents(result.content);
 *     });
 *   }, []);
 * 
 *   return <div>...</div>;
 * }
 * ```
 */
export function useEvents(): UseEventsReturn {
  const [state, setState] = useState<UseEventsState>({
    loading: false,
    error: null,
  });
  
  /**
   * Obtener lista de eventos
   */
  const fetchEvents = useCallback(async (params?: EventsQueryParams): Promise<PageResponse<Event> | null> => {
    setState({ loading: true, error: null });
    
    try {
      const result = await eventsApi.getEvents(params);
      setState({ loading: false, error: null });
      return result;
    } catch (error) {
      logError(error, 'useEvents.fetchEvents');
      const apiError = handleApiError(error);
      setState({ loading: false, error: apiError });
      return null;
    }
  }, []);
  
  /**
   * Obtener evento por ID
   */
  const fetchEventById = useCallback(async (id: number): Promise<Event | null> => {
    setState({ loading: true, error: null });
    
    try {
      const result = await eventsApi.getEventById(id);
      setState({ loading: false, error: null });
      return result;
    } catch (error) {
      logError(error, 'useEvents.fetchEventById');
      const apiError = handleApiError(error);
      setState({ loading: false, error: apiError });
      return null;
    }
  }, []);
  
  /**
   * Crear evento
   */
  const createEvent = useCallback(async (input: CreateEventInput): Promise<Event | null> => {
    setState({ loading: true, error: null });
    
    try {
      const result = await eventsApi.createEvent(input as any);
      setState({ loading: false, error: null });
      return result;
    } catch (error) {
      logError(error, 'useEvents.createEvent');
      const apiError = handleApiError(error);
      setState({ loading: false, error: apiError });
      return null;
    }
  }, []);
  
  /**
   * Actualizar evento
   */
  const updateEvent = useCallback(async (id: number, input: UpdateEventInput): Promise<Event | null> => {
    setState({ loading: true, error: null });
    
    try {
      const result = await eventsApi.updateEvent(id, input);
      setState({ loading: false, error: null });
      return result;
    } catch (error) {
      logError(error, 'useEvents.updateEvent');
      const apiError = handleApiError(error);
      setState({ loading: false, error: apiError });
      return null;
    }
  }, []);
  
  /**
   * Eliminar evento
   */
  const deleteEvent = useCallback(async (id: number): Promise<boolean> => {
    setState({ loading: true, error: null });
    
    try {
      await eventsApi.deleteEvent(id);
      setState({ loading: false, error: null });
      return true;
    } catch (error) {
      logError(error, 'useEvents.deleteEvent');
      const apiError = handleApiError(error);
      setState({ loading: false, error: apiError });
      return false;
    }
  }, []);
  
  /**
   * Cambiar estado de evento
   */
  const changeEventStatus = useCallback(async (
    eventId: number,
    input: ChangeStatusInput
  ): Promise<boolean> => {
    setState({ loading: true, error: null });
    
    try {
      await eventsApi.changeEventStatus(eventId, input);
      setState({ loading: false, error: null });
      return true;
    } catch (error) {
      logError(error, 'useEvents.changeEventStatus');
      const apiError = handleApiError(error);
      setState({ loading: false, error: apiError });
      return false;
    }
  }, []);
  
  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);
  
  return {
    loading: state.loading,
    error: state.error,
    fetchEvents,
    fetchEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    changeEventStatus,
    clearError,
  };
}

// ==================== EXPORTS ====================

export default useEvents;
