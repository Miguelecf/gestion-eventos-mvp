/**
 * ===================================================================
 * HOOK: useEventStatus
 * ===================================================================
 * Hook básico para operaciones CRUD de estados de eventos
 * Proporciona métodos para consultar y cambiar estados
 * Maneja loading y error states
 * ===================================================================
 */

import { useState, useCallback } from 'react';
import { eventStatusApi } from '@/services/api/event-status.api';
import type {
  EventStatus,
  EventStatusState,
  ChangeStatusInput,
  ChangeStatusResult,
} from '@/models/event-status';

export interface UseEventStatusReturn {
  // Estado
  loading: boolean;
  error: string | null;
  
  // Datos actuales
  statusState: EventStatusState | null;
  lastChangeResult: ChangeStatusResult | null;

  // Métodos principales
  fetchStatus: (eventId: number) => Promise<EventStatusState | null>;
  changeStatus: (eventId: number, input: ChangeStatusInput) => Promise<ChangeStatusResult | null>;
  canTransitionTo: (eventId: number, targetStatus: EventStatus) => Promise<boolean>;
  
  // Utilidades
  reset: () => void;
  clearError: () => void;
}

/**
 * Hook básico para gestionar estados de eventos
 * Proporciona funciones para consultar y cambiar estados con manejo de errores
 * 
 * @returns Objeto con métodos y estado de las operaciones
 * 
 * @example
 * function StatusManager() {
 *   const { fetchStatus, changeStatus, loading, error } = useEventStatus();
 * 
 *   const handleApprove = async () => {
 *     const result = await changeStatus(1, { to: 'APROBADO', note: 'OK' });
 *     if (result) {
 *       toast.success('Estado cambiado');
 *     }
 *   };
 * 
 *   return <button onClick={handleApprove} disabled={loading}>Aprobar</button>;
 * }
 */
export function useEventStatus(): UseEventStatusReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusState, setStatusState] = useState<EventStatusState | null>(null);
  const [lastChangeResult, setLastChangeResult] = useState<ChangeStatusResult | null>(null);

  /**
   * Obtiene el estado actual de un evento
   * 
   * @param eventId - ID del evento
   * @returns EventStatusState o null si hay error
   */
  const fetchStatus = useCallback(async (eventId: number): Promise<EventStatusState | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await eventStatusApi.getEventStatus(eventId);
      setStatusState(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener el estado';
      setError(errorMessage);
      console.error('[useEventStatus] Error fetching status:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cambia el estado de un evento
   * 
   * @param eventId - ID del evento
   * @param input - Datos del cambio de estado
   * @returns ChangeStatusResult o null si hay error
   */
  const changeStatus = useCallback(
    async (eventId: number, input: ChangeStatusInput): Promise<ChangeStatusResult | null> => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await eventStatusApi.changeStatus(eventId, input);
        setLastChangeResult(result);
        
        // Actualizar statusState con el nuevo estado
        if (statusState?.eventId === eventId) {
          setStatusState({
            ...statusState,
            currentStatus: result.newStatus,
          });
        }
        
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cambiar el estado';
        setError(errorMessage);
        console.error('[useEventStatus] Error changing status:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [statusState]
  );

  /**
   * Valida si se puede transicionar a un estado específico
   * 
   * @param eventId - ID del evento
   * @param targetStatus - Estado destino
   * @returns true si la transición es permitida
   */
  const canTransitionTo = useCallback(
    async (eventId: number, targetStatus: EventStatus): Promise<boolean> => {
      setLoading(true);
      setError(null);
      
      try {
        const canTransition = await eventStatusApi.canTransitionTo(eventId, targetStatus);
        return canTransition;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al validar transición';
        setError(errorMessage);
        console.error('[useEventStatus] Error checking transition:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Limpia el error actual
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reinicia todo el estado del hook
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setStatusState(null);
    setLastChangeResult(null);
  }, []);

  return {
    loading,
    error,
    statusState,
    lastChangeResult,
    fetchStatus,
    changeStatus,
    canTransitionTo,
    reset,
    clearError,
  };
}
