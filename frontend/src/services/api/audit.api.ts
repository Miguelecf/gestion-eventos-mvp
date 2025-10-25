/**
 * ===================================================================
 * SDK DE AUDITORÍA - API DE ALTO NIVEL
 * ===================================================================
 * Proporciona funciones de alto nivel para consultar historial de auditoría.
 * Integra httpClient + adaptadores + funciones de análisis.
 * ===================================================================
 */

import { httpClient } from './client';
import type { 
  BackendAuditPage,
  AuditActionType
} from './types/backend.types';
import type { PageResponse } from './types/pagination.types';
import {
  adaptAuditPageFromBackend,
  groupAuditEntriesByDate,
  groupAuditEntriesByAction,
  groupAuditEntriesByActor,
  filterAuditEntriesByAction,
  filterAuditEntriesByDateRange,
  filterAuditEntriesByActor,
  getAuditSummary,
  type AuditEntry
} from './adapters';

// ==================== TIPOS ESPECÍFICOS DEL SDK ====================

/**
 * Parámetros para obtener historial de auditoría
 */
export interface GetAuditHistoryParams {
  page?: number;
  size?: number;
  actionType?: AuditActionType; // Filtrar por tipo de acción
  actorId?: number; // Filtrar por usuario
  startDate?: string; // Filtrar por fecha (yyyy-MM-dd)
  endDate?: string; // Filtrar por fecha (yyyy-MM-dd)
}

/**
 * Resumen estadístico de auditoría
 */
export interface AuditSummary {
  total: number;
  byAction: Record<AuditActionType, number>;
  uniqueActors: number;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

/**
 * Timeline de auditoría agrupado por fecha
 */
export interface AuditTimeline {
  date: string;
  entries: AuditEntry[];
  count: number;
}

// ==================== FUNCIONES DEL SDK ====================

/**
 * Obtiene el historial de auditoría de un evento con paginación
 * 
 * @param eventId - ID del evento
 * @param params - Parámetros de paginación y filtros
 * @returns Página de entradas de auditoría adaptadas
 * 
 * @example
 * const auditPage = await auditApi.getAuditHistory(123, {
 *   page: 0,
 *   size: 20,
 *   actionType: 'STATUS_CHANGE'
 * });
 * 
 * auditPage.content.forEach(entry => {
 *   console.log(`${entry.actor.fullName}: ${entry.description}`);
 * });
 */
export async function getAuditHistory(
  eventId: number,
  params: GetAuditHistoryParams = {}
): Promise<PageResponse<AuditEntry>> {
  const { page = 0, size = 20, actionType, actorId, startDate, endDate } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString()
  });

  if (actionType) queryParams.append('actionType', actionType);
  if (actorId) queryParams.append('actorId', actorId.toString());
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);

  const backendPage = await httpClient.get<BackendAuditPage>(
    `/api/audit/${eventId}?${queryParams.toString()}`
  );

  return adaptAuditPageFromBackend(backendPage);
}

/**
 * Obtiene todo el historial de auditoría de un evento (sin paginación)
 * Útil para análisis completo y generación de reportes
 * 
 * @param eventId - ID del evento
 * @param filters - Filtros opcionales
 * @returns Array de todas las entradas de auditoría
 * 
 * @example
 * const allHistory = await auditApi.getAllAuditHistory(123);
 * const summary = auditApi.getSummary(allHistory);
 */
export async function getAllAuditHistory(
  eventId: number,
  filters?: {
    actionType?: AuditActionType;
    actorId?: number;
    startDate?: string;
    endDate?: string;
  }
): Promise<AuditEntry[]> {
  const queryParams = new URLSearchParams({
    page: '0',
    size: '1000' // Tamaño grande para obtener todos
  });

  if (filters?.actionType) queryParams.append('actionType', filters.actionType);
  if (filters?.actorId) queryParams.append('actorId', filters.actorId.toString());
  if (filters?.startDate) queryParams.append('startDate', filters.startDate);
  if (filters?.endDate) queryParams.append('endDate', filters.endDate);

  const backendPage = await httpClient.get<BackendAuditPage>(
    `/api/audit/${eventId}?${queryParams.toString()}`
  );

  const adaptedPage = adaptAuditPageFromBackend(backendPage);
  return adaptedPage.content;
}

/**
 * Obtiene el historial de cambios de estado de un evento
 * Shortcut para getAuditHistory filtrado por STATUS_CHANGE
 * 
 * @param eventId - ID del evento
 * @param params - Parámetros de paginación
 * @returns Página de cambios de estado
 * 
 * @example
 * const statusChanges = await auditApi.getStatusChanges(123);
 * statusChanges.content.forEach(entry => {
 *   console.log(`${entry.timestamp}: ${entry.fromValue} → ${entry.toValue}`);
 * });
 */
export async function getStatusChanges(
  eventId: number,
  params: Omit<GetAuditHistoryParams, 'actionType'> = {}
): Promise<PageResponse<AuditEntry>> {
  return getAuditHistory(eventId, {
    ...params,
    actionType: 'STATUS_CHANGE'
  });
}

/**
 * Obtiene el historial de modificaciones de campos de un evento
 * Shortcut para getAuditHistory filtrado por FIELD_CHANGE
 * 
 * @param eventId - ID del evento
 * @param params - Parámetros de paginación
 * @returns Página de modificaciones de campos
 * 
 * @example
 * const fieldChanges = await auditApi.getFieldChanges(123);
 */
export async function getFieldChanges(
  eventId: number,
  params: Omit<GetAuditHistoryParams, 'actionType'> = {}
): Promise<PageResponse<AuditEntry>> {
  return getAuditHistory(eventId, {
    ...params,
    actionType: 'FIELD_CHANGE'
  });
}

/**
 * Obtiene el historial de comentarios del sistema de auditoría
 * Shortcut para getAuditHistory filtrado por COMMENT
 * 
 * @param eventId - ID del evento
 * @param params - Parámetros de paginación
 * @returns Página de comentarios de auditoría
 * 
 * @example
 * const auditComments = await auditApi.getAuditComments(123);
 */
export async function getAuditComments(
  eventId: number,
  params: Omit<GetAuditHistoryParams, 'actionType'> = {}
): Promise<PageResponse<AuditEntry>> {
  return getAuditHistory(eventId, {
    ...params,
    actionType: 'COMMENT'
  });
}

/**
 * Obtiene timeline de auditoría agrupado por fecha
 * Organiza las entradas en un formato de línea de tiempo
 * 
 * @param eventId - ID del evento
 * @returns Array de entradas agrupadas por fecha
 * 
 * @example
 * const timeline = await auditApi.getTimeline(123);
 * timeline.forEach(day => {
 *   console.log(`${day.date} (${day.count} cambios):`);
 *   day.entries.forEach(entry => {
 *     console.log(`  - ${entry.description}`);
 *   });
 * });
 */
export async function getTimeline(eventId: number): Promise<AuditTimeline[]> {
  const allEntries = await getAllAuditHistory(eventId);
  const grouped = groupAuditEntriesByDate(allEntries);

  const timeline: AuditTimeline[] = [];
  grouped.forEach((entries, date) => {
    timeline.push({
      date,
      entries,
      count: entries.length
    });
  });

  // Ordenar por fecha descendente (más reciente primero)
  return timeline.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Obtiene resumen estadístico del historial de auditoría
 * 
 * @param eventId - ID del evento
 * @returns Estadísticas agregadas
 * 
 * @example
 * const summary = await auditApi.getSummary(123);
 * console.log(`Total de cambios: ${summary.total}`);
 * console.log(`Cambios de estado: ${summary.byAction.STATUS_CHANGE}`);
 * console.log(`Usuarios únicos: ${summary.uniqueActors}`);
 */
export async function getSummary(eventId: number): Promise<AuditSummary> {
  const allEntries = await getAllAuditHistory(eventId);
  return getAuditSummary(allEntries);
}

/**
 * Obtiene el historial de un usuario específico en un evento
 * 
 * @param eventId - ID del evento
 * @param actorId - ID del usuario
 * @param params - Parámetros adicionales
 * @returns Página de entradas del usuario
 * 
 * @example
 * const userHistory = await auditApi.getUserHistory(123, 456);
 */
export async function getUserHistory(
  eventId: number,
  actorId: number,
  params: Omit<GetAuditHistoryParams, 'actorId'> = {}
): Promise<PageResponse<AuditEntry>> {
  return getAuditHistory(eventId, {
    ...params,
    actorId
  });
}

/**
 * Obtiene entradas de auditoría en un rango de fechas
 * 
 * @param eventId - ID del evento
 * @param startDate - Fecha inicial (yyyy-MM-dd)
 * @param endDate - Fecha final (yyyy-MM-dd)
 * @returns Array de entradas en el rango
 * 
 * @example
 * const lastWeek = await auditApi.getEntriesByDateRange(
 *   123,
 *   '2025-01-01',
 *   '2025-01-07'
 * );
 */
export async function getEntriesByDateRange(
  eventId: number,
  startDate: string,
  endDate: string
): Promise<AuditEntry[]> {
  return getAllAuditHistory(eventId, { startDate, endDate });
}

/**
 * Agrupa entradas de auditoría por tipo de acción
 * 
 * @param eventId - ID del evento
 * @returns Map con entradas agrupadas por tipo
 * 
 * @example
 * const grouped = await auditApi.groupByAction(123);
 * const statusChanges = grouped.get('STATUS_CHANGE') || [];
 */
export async function groupByAction(
  eventId: number
): Promise<Map<AuditActionType, AuditEntry[]>> {
  const allEntries = await getAllAuditHistory(eventId);
  return groupAuditEntriesByAction(allEntries);
}

/**
 * Agrupa entradas de auditoría por actor
 * 
 * @param eventId - ID del evento
 * @returns Map con entradas agrupadas por usuario
 * 
 * @example
 * const grouped = await auditApi.groupByActor(123);
 * grouped.forEach((entries, actorId) => {
 *   console.log(`Usuario ${actorId}: ${entries.length} acciones`);
 * });
 */
export async function groupByActor(
  eventId: number
): Promise<Map<number, AuditEntry[]>> {
  const allEntries = await getAllAuditHistory(eventId);
  return groupAuditEntriesByActor(allEntries);
}

/**
 * Exporta historial de auditoría a diferentes formatos
 * 
 * @param eventId - ID del evento
 * @param format - Formato de exportación ('pdf' | 'excel')
 * @param filters - Filtros opcionales
 * @returns Blob con el archivo
 * 
 * @example
 * const blob = await auditApi.exportAudit(123, 'pdf');
 * 
 * // Descargar archivo
 * const url = URL.createObjectURL(blob);
 * const a = document.createElement('a');
 * a.href = url;
 * a.download = 'auditoria.pdf';
 * a.click();
 */
export async function exportAudit(
  eventId: number,
  format: 'pdf' | 'excel',
  filters?: {
    actionType?: AuditActionType;
    actorId?: number;
    startDate?: string;
    endDate?: string;
  }
): Promise<Blob> {
  const queryParams = new URLSearchParams();
  queryParams.append('format', format);

  if (filters?.actionType) queryParams.append('actionType', filters.actionType);
  if (filters?.actorId) queryParams.append('actorId', filters.actorId.toString());
  if (filters?.startDate) queryParams.append('startDate', filters.startDate);
  if (filters?.endDate) queryParams.append('endDate', filters.endDate);

  const response = await fetch(
    `/api/audit/${eventId}/export?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Error al exportar auditoría');
  }

  return await response.blob();
}

/**
 * Obtiene la última entrada de auditoría de un evento
 * Útil para mostrar "última actividad"
 * 
 * @param eventId - ID del evento
 * @returns Última entrada o null si no hay historial
 * 
 * @example
 * const lastEntry = await auditApi.getLastEntry(123);
 * if (lastEntry) {
 *   console.log(`Última actividad: ${lastEntry.description}`);
 * }
 */
export async function getLastEntry(eventId: number): Promise<AuditEntry | null> {
  const page = await getAuditHistory(eventId, { page: 0, size: 1 });
  return page.content[0] || null;
}

/**
 * Obtiene el conteo total de entradas de auditoría
 * 
 * @param eventId - ID del evento
 * @returns Número total de entradas
 * 
 * @example
 * const count = await auditApi.getCount(123);
 * console.log(`Total de cambios: ${count}`);
 */
export async function getCount(eventId: number): Promise<number> {
  const page = await getAuditHistory(eventId, { page: 0, size: 1 });
  return page.page.totalElements;
}

/**
 * Verifica si un evento tiene historial de auditoría
 * 
 * @param eventId - ID del evento
 * @returns true si tiene historial
 * 
 * @example
 * if (await auditApi.hasHistory(123)) {
 *   // Mostrar botón de historial
 * }
 */
export async function hasHistory(eventId: number): Promise<boolean> {
  const count = await getCount(eventId);
  return count > 0;
}

// ==================== HELPERS LOCALES (re-exportados) ====================

/**
 * Filtra entradas por tipo de acción
 * @param entries - Array de entradas
 * @param actionTypes - Tipos de acción a incluir
 */
export { filterAuditEntriesByAction as filterByAction } from './adapters';

/**
 * Filtra entradas por rango de fechas
 * @param entries - Array de entradas
 * @param startDate - Fecha inicial
 * @param endDate - Fecha final
 */
export { filterAuditEntriesByDateRange as filterByDateRange } from './adapters';

/**
 * Filtra entradas por actor
 * @param entries - Array de entradas
 * @param actorId - ID del actor
 */
export { filterAuditEntriesByActor as filterByActor } from './adapters';

// ==================== EXPORT DEFAULT ====================

/**
 * API de Auditoría - Objeto con todas las funciones
 * Permite importar como: import { auditApi } from '@/services/api'
 */
export const auditApi = {
  getAuditHistory,
  getAllAuditHistory,
  getStatusChanges,
  getFieldChanges,
  getAuditComments,
  getTimeline,
  getSummary,
  getUserHistory,
  getEntriesByDateRange,
  groupByAction,
  groupByActor,
  exportAudit,
  getLastEntry,
  getCount,
  hasHistory,
  // Re-exports de helpers
  filterByAction: filterAuditEntriesByAction,
  filterByDateRange: filterAuditEntriesByDateRange,
  filterByActor: filterAuditEntriesByActor
};

// Export individual de funciones para tree-shaking
export default auditApi;
