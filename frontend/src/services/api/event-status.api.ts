/**
 * ===================================================================
 * SDK DE ESTADOS DE EVENTOS
 * ===================================================================
 * API client para operaciones de estados de eventos
 * GET /api/events/{id}/status - Obtener estado actual y transiciones
 * POST /api/events/{id}/status - Cambiar estado
 * ===================================================================
 */

import { httpClient } from './client';
import type {
  EventStatusState,
  ChangeStatusInput,
  ChangeStatusResult,
  EventStatus,
} from '@/models/event-status';
import type {
  BackendEventStatusResponse,
  BackendChangeStatusRequest,
  BackendStatusChangeResponse,
} from './types/backend.types';
import {
  adaptEventStatusFromBackend,
  adaptChangeStatusForBackend,
  adaptChangeStatusFromBackend,
  isTransitionAllowed,
} from './adapters/event-status.adapter';

/**
 * SDK de Estados de Eventos
 * Proporciona métodos para:
 * - Consultar el estado actual de un evento
 * - Cambiar el estado de un evento
 * - Validar transiciones permitidas
 */
export const eventStatusApi = {
  /**
   * Obtiene el estado actual de un evento y sus transiciones permitidas
   * 
   * @param eventId - ID del evento
   * @returns EventStatusState con estado actual y transiciones permitidas
   * @throws Error si el evento no existe o hay problemas de red
   * 
   * @example
   * const status = await eventStatusApi.getEventStatus(1);
   * console.log(status.currentStatus); // 'EN_REVISION'
   * console.log(status.allowedTransitions); // ['RESERVADO', 'RECHAZADO']
   */
  async getEventStatus(eventId: number): Promise<EventStatusState> {
    const response = await httpClient.get<BackendEventStatusResponse>(
      `/api/events/${eventId}/status`
    );
    return adaptEventStatusFromBackend(response);
  },

  /**
   * Cambia el estado de un evento
   * 
   * @param eventId - ID del evento
   * @param input - Datos del cambio (estado destino, motivo, nota)
   * @returns ChangeStatusResult con el nuevo estado y detalles
   * @throws Error si la transición no es permitida o faltan datos requeridos
   * 
   * @example
   * const result = await eventStatusApi.changeStatus(1, {
   *   to: 'APROBADO',
   *   note: 'Todo en orden'
   * });
   * 
   * if (result.approvalPending) {
   *   console.log('Faltan aprobaciones:', result.missingApprovals);
   * }
   */
  async changeStatus(
    eventId: number,
    input: ChangeStatusInput
  ): Promise<ChangeStatusResult> {
    const body = adaptChangeStatusForBackend(input);
    const response = await httpClient.post<BackendStatusChangeResponse>(
      `/api/events/${eventId}/status`,
      body
    );
    return adaptChangeStatusFromBackend(response);
  },

  /**
   * Valida si se puede transicionar a un estado específico
   * Consulta las transiciones permitidas desde el backend
   * 
   * @param eventId - ID del evento
   * @param targetStatus - Estado al que se quiere transicionar
   * @returns true si la transición es permitida
   * @throws Error si hay problemas de red
   * 
   * @example
   * const canApprove = await eventStatusApi.canTransitionTo(1, 'APROBADO');
   * if (!canApprove) {
   *   alert('No puedes aprobar este evento en su estado actual');
   * }
   */
  async canTransitionTo(
    eventId: number,
    targetStatus: EventStatus
  ): Promise<boolean> {
    const statusState = await this.getEventStatus(eventId);
    return isTransitionAllowed(
      statusState.currentStatus,
      targetStatus,
      statusState.allowedTransitions
    );
  },

  /**
   * Obtiene las transiciones permitidas sin consultar el backend
   * Útil para validación en tiempo real usando datos en caché
   * 
   * @param statusState - Estado actual del evento
   * @param targetStatus - Estado al que se quiere transicionar
   * @returns true si la transición es permitida
   * 
   * @example
   * // Con datos previamente cargados:
   * const statusState = useEventStatusStore(state => state.currentStatus);
   * const canReject = eventStatusApi.isTransitionAllowedLocally(statusState, 'RECHAZADO');
   */
  isTransitionAllowedLocally(
    statusState: EventStatusState,
    targetStatus: EventStatus
  ): boolean {
    return isTransitionAllowed(
      statusState.currentStatus,
      targetStatus,
      statusState.allowedTransitions
    );
  },
};

export default eventStatusApi;
