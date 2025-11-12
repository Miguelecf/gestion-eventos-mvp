/**
 * ===================================================================
 * HOOK: useEventStatusManager
 * ===================================================================
 * Hook especializado para gestión de estados en DetailPage
 * Auto-carga el estado al montar el componente
 * Proporciona helpers para UI (canChangeTo, isLoading, etc.)
 * Maneja refetch después de cambios
 * ===================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { eventStatusApi } from '@/services/api/event-status.api';
import type {
  EventStatus,
  EventStatusState,
  ChangeStatusInput,
  ChangeStatusResult,
} from '@/models/event-status';
import { requiresReason, getTransitionMessage } from '@/services/api/adapters';

export interface UseEventStatusManagerOptions {
  eventId: number;
  autoLoad?: boolean;
  onStatusChange?: (result: ChangeStatusResult) => void;
  onError?: (error: string) => void;
}

export interface UseEventStatusManagerReturn {
  // Estado
  loading: boolean;
  changing: boolean;
  error: string | null;
  
  // Datos
  statusState: EventStatusState | null;
  currentStatus: EventStatus | null;
  allowedTransitions: EventStatus[];
  lastChangeResult: ChangeStatusResult | null;

  // Métodos principales
  refetch: () => Promise<void>;
  changeStatus: (input: ChangeStatusInput) => Promise<ChangeStatusResult | null>;
  
  // Helpers para UI
  canChangeTo: (targetStatus: EventStatus) => boolean;
  requiresReasonFor: (targetStatus: EventStatus) => boolean;
  getTransitionMessageFor: (targetStatus: EventStatus) => string;
  isTransitioning: boolean;
  hasError: boolean;
  
  // Utilidades
  clearError: () => void;
}

/**
 * Hook especializado para gestión de estados en DetailPage
 * Auto-carga el estado y proporciona helpers para la UI
 * 
 * @param options - Configuración del hook
 * @returns Objeto con métodos, estado y helpers
 * 
 * @example
 * function EventDetailPage({ eventId }) {
 *   const {
 *     currentStatus,
 *     canChangeTo,
 *     changeStatus,
 *     loading,
 *     allowedTransitions
 *   } = useEventStatusManager({
 *     eventId,
 *     autoLoad: true,
 *     onStatusChange: (result) => {
 *       toast.success(`Estado cambiado a ${result.newStatus}`);
 *     }
 *   });
 * 
 *   return (
 *     <div>
 *       <StatusBadge status={currentStatus} />
 *       {allowedTransitions.map(status => (
 *         <Button
 *           key={status}
 *           disabled={!canChangeTo(status)}
 *           onClick={() => changeStatus({ to: status })}
 *         >
 *           Cambiar a {status}
 *         </Button>
 *       ))}
 *     </div>
 *   );
 * }
 */
export function useEventStatusManager(
  options: UseEventStatusManagerOptions
): UseEventStatusManagerReturn {
  const { eventId, autoLoad = true, onStatusChange, onError } = options;

  const [loading, setLoading] = useState(false);
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusState, setStatusState] = useState<EventStatusState | null>(null);
  const [lastChangeResult, setLastChangeResult] = useState<ChangeStatusResult | null>(null);

  /**
   * Carga el estado del evento desde el backend
   */
  const loadStatus = useCallback(async () => {
    if (!eventId) return;

    // ✅ FIX: Evitar múltiples llamadas simultáneas
    if (loading) {
      console.log('[useEventStatusManager] Carga ya en progreso, saltando...');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('[useEventStatusManager] Cargando estado para evento:', eventId);
      const result = await eventStatusApi.getEventStatus(eventId);
      console.log('[useEventStatusManager] Estado cargado exitosamente:', result);
      setStatusState(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar el estado';
      setError(errorMessage);
      console.error('[useEventStatusManager] Error loading status:', err);
      
      // ✅ FIX: Solo llamar onError si NO es error de permisos (evitar spam de toasts)
      if (onError && !errorMessage.includes('permisos')) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [eventId, onError, loading]);

  /**
   * Efecto de auto-carga al montar el componente
   * ✅ FIX: Solo ejecutar una vez cuando se monta
   */
  useEffect(() => {
    if (autoLoad && eventId) {
      console.log('[useEventStatusManager] Auto-load inicial para evento:', eventId);
      loadStatus();
    }
    // ✅ CRÍTICO: NO incluir loadStatus en deps para evitar bucles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, eventId]);

  /**
   * Refetch manual del estado
   */
  const refetch = useCallback(async () => {
    await loadStatus();
  }, [loadStatus]);

  /**
   * Cambia el estado del evento
   * 
   * @param input - Datos del cambio de estado
   * @returns ChangeStatusResult o null si hay error
   */
  const changeStatus = useCallback(
    async (input: ChangeStatusInput): Promise<ChangeStatusResult | null> => {
      if (!eventId) {
        setError('No se puede cambiar el estado: eventId no proporcionado');
        return null;
      }

      setChanging(true);
      setError(null);
      
      try {
        const result = await eventStatusApi.changeStatus(eventId, input);
        setLastChangeResult(result);
        
        // Actualizar statusState local con el nuevo estado
        if (statusState) {
          setStatusState({
            ...statusState,
            currentStatus: result.newStatus,
          });
        }
        
        // Llamar callback de éxito
        onStatusChange?.(result);
        
        // Refetch para obtener nuevas transiciones permitidas
        await refetch();
        
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cambiar el estado';
        setError(errorMessage);
        console.error('[useEventStatusManager] Error changing status:', err);
        onError?.(errorMessage);
        return null;
      } finally {
        setChanging(false);
      }
    },
    [eventId, statusState, onStatusChange, onError, refetch]
  );

  /**
   * Valida si se puede cambiar a un estado específico (usando datos locales)
   * 
   * @param targetStatus - Estado destino
   * @returns true si la transición es permitida
   */
  const canChangeTo = useCallback(
    (targetStatus: EventStatus): boolean => {
      if (!statusState) return false;
      return statusState.allowedTransitions.includes(targetStatus);
    },
    [statusState]
  );

  /**
   * Verifica si un estado destino requiere motivo obligatorio
   * 
   * @param targetStatus - Estado destino
   * @returns true si requiere motivo
   */
  const requiresReasonFor = useCallback((targetStatus: EventStatus): boolean => {
    return requiresReason(targetStatus);
  }, []);

  /**
   * Obtiene el mensaje de confirmación para una transición
   * 
   * @param targetStatus - Estado destino
   * @returns Mensaje descriptivo
   */
  const getTransitionMessageFor = useCallback(
    (targetStatus: EventStatus): string => {
      if (!statusState) return '';
      return getTransitionMessage(statusState.currentStatus, targetStatus);
    },
    [statusState]
  );

  /**
   * Limpia el error actual
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    changing,
    error,
    statusState,
    currentStatus: statusState?.currentStatus ?? null,
    allowedTransitions: statusState?.allowedTransitions ?? [],
    lastChangeResult,
    refetch,
    changeStatus,
    canChangeTo,
    requiresReasonFor,
    getTransitionMessageFor,
    isTransitioning: changing,
    hasError: error !== null,
    clearError,
  };
}
