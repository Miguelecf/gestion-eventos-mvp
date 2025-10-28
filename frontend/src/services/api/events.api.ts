/**
 * ===================================================================
 * SDK DE EVENTOS - API DE ALTO NIVEL
 * ===================================================================
 * Proporciona funciones de alto nivel para gestionar eventos.
 * Integra httpClient + adaptadores + manejo de errores.
 * ===================================================================
 */

import { httpClient } from './client';
import { ENDPOINTS } from './client/config';
import type { 
  BackendEventDTO, 
  BackendStatusChangeResponse,
  BackendSpaceAvailabilityResponse,
  EventStatus
} from './types/backend.types';
import type { SpringPageResponse, PageResponse } from './types/pagination.types';
import {
  adaptEventFromBackend,
  adaptEventsFromBackend,
  adaptEventForCreate,
  adaptEventForUpdate
} from './adapters';
import { adaptSpringPage, buildPaginationQuery } from './adapters/pagination.adapter';
import type { Event, EventFilters } from '@/models/event';

// ==================== TIPOS ESPECÍFICOS DEL SDK ====================

/**
 * Parámetros de consulta para listar eventos
 */
export interface EventsQueryParams {
  page?: number;
  size?: number;
  sort?: Array<{ field: string; direction: 'ASC' | 'DESC' }>;
  filters?: EventFilters;
}

/**
 * Input para crear un evento (tipo alias para Event parcial)
 */
export type CreateEventInput = Omit<Event, 'id' | 'version' | 'createdBy' | 'createdAt' | 'lastModifiedAt'>;

/**
 * Input para actualizar un evento (tipo alias para Event parcial)
 */
export type UpdateEventInput = Partial<Omit<Event, 'id' | 'createdBy' | 'createdAt'>>;

/**
 * Parámetros para cambiar el estado de un evento
 */
export interface ChangeStatusInput {
  newStatus: EventStatus;
  reason?: string;
}

/**
 * Parámetros para verificar disponibilidad de espacio
 */
export interface AvailabilityCheckParams {
  spaceId: number;
  date: string; // yyyy-MM-dd
  scheduleFrom: string; // HH:mm
  scheduleTo: string; // HH:mm
  bufferBeforeMin?: number;
  bufferAfterMin?: number;
  excludeEventId?: number; // Para excluir evento actual al editar
}

/**
 * Parámetros para obtener eventos del calendario
 */
export interface CalendarEventsParams {
  startDate: string;
  endDate: string;
  spaceIds?: number[];
}

/**
 * Parámetros para estadísticas de eventos
 */
export interface EventStatsParams {
  startDate?: string;
  endDate?: string;
  groupBy?: 'status' | 'space' | 'department';
}

/**
 * Parámetros para exportar eventos
 */
export interface ExportEventsParams {
  format: 'pdf' | 'excel' | 'ics';
  filters?: EventFilters;
}

/**
 * Respuesta de disponibilidad adaptada
 */
export interface AvailabilityResponse {
  available: boolean;
  conflicts: Array<{
    eventId: number;
    eventName: string;
    from: string;
    to: string;
    status?: string;
    priority?: string;
    bufferBefore?: number;
    bufferAfter?: number;
  }>;
}

// ==================== FUNCIONES DEL SDK ====================

/**
 * Obtiene una página de eventos con filtros y paginación
 * 
 * @param params - Parámetros de consulta (paginación + filtros)
 * @returns Página de eventos adaptados al modelo del frontend
 * 
 * @example
 * const page = await eventsApi.getEvents({
 *   page: 0,
 *   size: 20,
 *   sort: [{ field: 'date', direction: 'DESC' }],
 *   filters: {
 *     status: ['SOLICITADO', 'EN_REVISION'],
 *     startDate: '2025-01-01',
 *     endDate: '2025-12-31'
 *   }
 * });
 */
export async function getEvents(params: EventsQueryParams = {}): Promise<PageResponse<Event>> {
  // 1. Construir query params de paginación
  const paginationQuery = buildPaginationQuery(params);

  // 2. Agregar filtros si existen
  if (params.filters) {
    const { status, startDate, endDate, spaceIds, departmentIds, requiresTech, createdBy } = params.filters;

    if (status && status.length > 0) {
      status.forEach(s => paginationQuery.append('status', s));
    }
    if (startDate) paginationQuery.append('startDate', startDate);
    if (endDate) paginationQuery.append('endDate', endDate);
    if (spaceIds && spaceIds.length > 0) {
      spaceIds.forEach(id => paginationQuery.append('spaceIds', id.toString()));
    }
    if (departmentIds && departmentIds.length > 0) {
      departmentIds.forEach(id => paginationQuery.append('departmentIds', id.toString()));
    }
    if (requiresTech !== undefined) {
      paginationQuery.append('requiresTech', requiresTech.toString());
    }
    if (createdBy) {
      paginationQuery.append('createdBy', createdBy);
    }
  }

  // 3. Hacer request al backend
  const backendPage = await httpClient.get<SpringPageResponse<BackendEventDTO>>(
    `${ENDPOINTS.EVENTS}?${paginationQuery.toString()}`
  );

  // 4. Adaptar página usando el adaptador de Spring Page
  return adaptSpringPage(backendPage, adaptEventFromBackend);
}

/**
 * Obtiene un evento por su ID
 * 
 * @param eventId - ID del evento
 * @returns Evento adaptado al modelo del frontend
 * 
 * @throws {ApiError} Si el evento no existe (404)
 * 
 * @example
 * const event = await eventsApi.getEventById(123);
 * console.log(event.name); // "Conferencia 2025"
 */
export async function getEventById(eventId: number): Promise<Event> {
  const backendEvent = await httpClient.get<BackendEventDTO>(
    ENDPOINTS.EVENTS.replace(':id', eventId.toString())
  );

  return adaptEventFromBackend(backendEvent);
}

/**
 * Crea un nuevo evento
 * 
 * @param eventData - Datos del evento a crear
 * @returns Evento creado y adaptado
 * 
 * @throws {ApiError} Si hay errores de validación (400)
 * 
 * @example
 * const newEvent = await eventsApi.createEvent({
 *   name: 'Conferencia 2025',
 *   date: '2025-12-01',
 *   scheduleFrom: '09:00',
 *   scheduleTo: '11:00',
 *   priority: 'HIGH',
 *   audienceType: 'ESTUDIANTES',
 *   internal: false,
 *   requiresTech: true,
 *   contactName: 'Juan Pérez',
 *   contactEmail: 'juan@example.com',
 *   contactPhone: '+54 9 11 1234-5678'
 * });
 */
export async function createEvent(
  eventData: Partial<Event> & {
    name: string;
    date: string;
    scheduleFrom: string;
    scheduleTo: string;
    priority: Event['priority'];
    audienceType: Event['audienceType'];
    internal: boolean;
    requiresTech: boolean;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
  }
): Promise<Event> {
  // 1. Adaptar datos del frontend al formato del backend
  const createDTO = adaptEventForCreate(eventData);

  // 2. Enviar al backend
  const createdEvent = await httpClient.post<BackendEventDTO>(
    ENDPOINTS.EVENTS,
    createDTO
  );

  // 3. Adaptar respuesta
  return adaptEventFromBackend(createdEvent);
}

/**
 * Actualiza un evento existente
 * Solo envía los campos que fueron modificados
 * 
 * @param eventId - ID del evento a actualizar
 * @param updates - Campos a actualizar (solo los modificados)
 * @returns Evento actualizado y adaptado
 * 
 * @throws {ApiError} Si el evento no existe (404) o no es editable (400)
 * 
 * @example
 * const updated = await eventsApi.updateEvent(123, {
 *   name: 'Nuevo nombre',
 *   priority: 'HIGH'
 * });
 */
export async function updateEvent(
  eventId: number,
  updates: Partial<Event> & { audienceType?: 'ESTUDIANTES' | 'COMUNIDAD' | 'MIXTO' }
): Promise<Event> {
  // 1. Adaptar solo los campos modificados
  const updateDTO = adaptEventForUpdate(updates);

  // 2. Enviar al backend
  const updatedEvent = await httpClient.patch<BackendEventDTO>(
    ENDPOINTS.EVENTS.replace(':id', eventId.toString()),
    updateDTO
  );

  // 3. Adaptar respuesta
  return adaptEventFromBackend(updatedEvent);
}

/**
 * Elimina un evento
 * 
 * @param eventId - ID del evento a eliminar
 * 
 * @throws {ApiError} Si el evento no existe (404) o no puede eliminarse (400)
 * 
 * @example
 * await eventsApi.deleteEvent(123);
 */
export async function deleteEvent(eventId: number): Promise<void> {
  await httpClient.delete(ENDPOINTS.EVENTS.replace(':id', eventId.toString()));
}

/**
 * Cambia el estado de un evento
 * 
 * @param eventId - ID del evento
 * @param params - Parámetros del cambio de estado
 * @returns Información sobre el cambio de estado
 * 
 * @throws {ApiError} Si la transición no es válida (400)
 * 
 * @example
 * const result = await eventsApi.changeEventStatus(123, {
 *   newStatus: 'APROBADO',
 *   reason: 'Revisión completada'
 * });
 * 
 * if (result.approvalPending) {
 *   console.log('Aprobaciones pendientes:', result.missingApprovals);
 * }
 */
export async function changeEventStatus(
  eventId: number,
  params: ChangeStatusInput
): Promise<BackendStatusChangeResponse> {
  return await httpClient.post<BackendStatusChangeResponse>(
    ENDPOINTS.EVENTS.replace(':id', eventId.toString()) + '/status',
    params
  );
}

/**
 * Verifica disponibilidad de un espacio para una fecha/hora
 * 
 * @param params - Parámetros de disponibilidad
 * @returns Información sobre disponibilidad y conflictos
 * 
 * @example
 * const availability = await eventsApi.checkAvailability({
 *   spaceId: 5,
 *   date: '2025-12-01',
 *   scheduleFrom: '09:00',
 *   scheduleTo: '11:00',
 *   bufferBeforeMin: 15,
 *   bufferAfterMin: 15
 * });
 * 
 * if (!availability.available) {
 *   console.log('Conflictos:', availability.conflicts);
 * }
 */
export async function checkAvailability(
  params: AvailabilityCheckParams
): Promise<AvailabilityResponse> {
  const response = await httpClient.post<BackendSpaceAvailabilityResponse>(
    '/api/events/check-availability',
    params
  );

  // Adaptar respuesta (ya está en formato adecuado, solo normalizar)
  return {
    available: response.available,
    conflicts: response.conflicts.map(conflict => ({
      eventId: conflict.eventId,
      eventName: conflict.eventName,
      from: conflict.from,
      to: conflict.to,
      status: conflict.status,
      priority: conflict.priority,
      bufferBefore: conflict.bufferBefore,
      bufferAfter: conflict.bufferAfter
    }))
  };
}

/**
 * Obtiene eventos de calendario en un rango de fechas
 * Optimizado para vistas de calendario
 * 
 * @param startDate - Fecha inicial (yyyy-MM-dd)
 * @param endDate - Fecha final (yyyy-MM-dd)
 * @returns Array de eventos en el rango
 * 
 * @example
 * const events = await eventsApi.getCalendarEvents(
 *   '2025-12-01',
 *   '2025-12-31'
 * );
 */
export async function getCalendarEvents(
  startDate: string,
  endDate: string
): Promise<Event[]> {
  const backendEvents = await httpClient.get<BackendEventDTO[]>(
    `/api/events/range?start=${startDate}&end=${endDate}`
  );

  return adaptEventsFromBackend(backendEvents);
}

/**
 * Obtiene estadísticas de eventos
 * 
 * @param filters - Filtros opcionales
 * @returns Estadísticas agregadas
 * 
 * @example
 * const stats = await eventsApi.getEventStats({
 *   startDate: '2025-01-01',
 *   endDate: '2025-12-31'
 * });
 */
export async function getEventStats(filters?: {
  startDate?: string;
  endDate?: string;
  departmentIds?: number[];
}): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  bySpace: Record<string, number>;
}> {
  const queryParams = new URLSearchParams();
  if (filters?.startDate) queryParams.append('startDate', filters.startDate);
  if (filters?.endDate) queryParams.append('endDate', filters.endDate);
  if (filters?.departmentIds) {
    filters.departmentIds.forEach(id => queryParams.append('departmentIds', id.toString()));
  }

  return await httpClient.get(
    `/api/events/stats?${queryParams.toString()}`
  );
}

/**
 * Exporta eventos a diferentes formatos
 * 
 * @param format - Formato de exportación ('pdf' | 'excel' | 'ics')
 * @param filters - Filtros opcionales
 * @returns Blob con el archivo
 * 
 * @example
 * const blob = await eventsApi.exportEvents('excel', {
 *   startDate: '2025-01-01',
 *   endDate: '2025-12-31'
 * });
 * 
 * // Descargar archivo
 * const url = URL.createObjectURL(blob);
 * const a = document.createElement('a');
 * a.href = url;
 * a.download = 'eventos.xlsx';
 * a.click();
 */
export async function exportEvents(
  format: 'pdf' | 'excel' | 'ics',
  filters?: EventFilters
): Promise<Blob> {
  const queryParams = new URLSearchParams();
  queryParams.append('format', format);

  if (filters) {
    if (filters.status) filters.status.forEach(s => queryParams.append('status', s));
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.spaceIds) filters.spaceIds.forEach(id => queryParams.append('spaceIds', id.toString()));
    if (filters.departmentIds) filters.departmentIds.forEach(id => queryParams.append('departmentIds', id.toString()));
  }

  const response = await fetch(
    `${ENDPOINTS.EVENTS}/export?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Error al exportar eventos');
  }

  return await response.blob();
}

// ==================== EXPORT DEFAULT ====================

/**
 * API de Eventos - Objeto con todas las funciones
 * Permite importar como: import { eventsApi } from '@/services/api'
 */
export const eventsApi = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  changeEventStatus,
  checkAvailability,
  getCalendarEvents,
  getEventStats,
  exportEvents
};

// Export individual de funciones para tree-shaking
export default eventsApi;
