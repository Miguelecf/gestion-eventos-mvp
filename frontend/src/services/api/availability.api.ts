/**
 * ===================================================================
 * SDK DE DISPONIBILIDAD Y CAPACIDAD TÉCNICA - API DE ALTO NIVEL
 * ===================================================================
 * Proporciona funciones de alto nivel para consultar disponibilidad
 * de espacios y capacidad técnica.
 * ===================================================================
 */

import { httpClient } from './client';
import { ENDPOINTS } from './client/config';
import type { 
  BackendTechnicalCapacityResponse,
  EventStatus,
  Priority
} from './types/backend.types';
import { toBackendDate } from './adapters';

// ==================== TIPOS ESPECÍFICOS DEL SDK ====================

/**
 * Parámetros para verificar disponibilidad de espacio
 */
export interface CheckAvailabilityParams {
  spaceId: number;
  date: string; // yyyy-MM-dd o Date
  scheduleFrom: string; // HH:mm
  scheduleTo: string; // HH:mm
  bufferBeforeMin?: number;
  bufferAfterMin?: number;
  excludeEventId?: number; // Para excluir evento actual al editar
}

/**
 * Conflicto de disponibilidad adaptado
 */
export interface AvailabilityConflict {
  eventId?: number;
  eventName?: string;
  from: string; // HH:mm
  to: string; // HH:mm
  status?: EventStatus | string | null;
  priority?: Priority;
  bufferBefore?: number;
  bufferAfter?: number;
}

/**
 * Respuesta de disponibilidad adaptada
 */
export interface AvailabilityResult {
  available: boolean;
  skipped?: boolean;
  reason?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  conflicts: AvailabilityConflict[];
  suggestions?: Array<{ from: string; to: string }>;
  message: string; // Mensaje descriptivo
}

/**
 * Bloque de capacidad técnica
 */
export interface TechCapacityBlock {
  time: string; // HH:mm
  from: string; // HH:mm
  to: string; // HH:mm
  used: number;
  available: number;
  utilizationPercent: number;
  isOverCapacity: boolean;
}

/**
 * Respuesta de capacidad técnica adaptada
 */
export interface TechCapacityResult {
  date: string; // yyyy-MM-dd
  maxCapacity: number;
  blocks: TechCapacityBlock[];
  summary: {
    totalUsed: number;
    totalAvailable: number;
    averageUtilization: number;
    peakUtilization: number;
    peakTime: string;
    hasOverCapacity: boolean;
  };
}

/**
 * Evento con soporte técnico
 */
export interface TechSupportEvent {
  id: number;
  name: string;
  date: string;
  scheduleFrom: string;
  scheduleTo: string;
  spaceId: number;
  spaceName: string;
  techSupportMode: string;
  status: EventStatus;
}

/**
 * Parámetros para obtener eventos con soporte técnico
 */
export interface GetTechEventsParams {
  date: string; // yyyy-MM-dd o Date
}

/**
 * Parámetros para ocupación pública de espacio
 */
export interface GetSpaceOccupancyParams {
  spaceId: number;
  date: string; // yyyy-MM-dd o Date
}

/**
 * Slot de ocupación de espacio
 */
export interface OccupancySlot {
  from: string; // HH:mm
  to: string; // HH:mm
  eventName?: string;
  status?: EventStatus | string | null;
}

/**
 * Respuesta de ocupación de espacio
 */
export interface SpaceOccupancyResult {
  spaceId: number;
  spaceName?: string | null;
  date: string;
  occupied: OccupancySlot[];
  availableSlots: Array<{ from: string; to: string }>;
}

export interface RawAvailabilityConflict {
  eventId?: number | null;
  id?: number | null;
  eventName?: string | null;
  title?: string | null;
  name?: string | null;
  from?: string | null;
  to?: string | null;
  scheduleFrom?: string | null;
  scheduleTo?: string | null;
  status?: EventStatus | string | null;
  priority?: Priority | null;
  bufferBefore?: number | null;
  bufferAfter?: number | null;
  bufferBeforeMin?: number | null;
  bufferAfterMin?: number | null;
}

export interface RawAvailabilityResponse {
  available?: boolean | null;
  isAvailable?: boolean | null;
  skipped?: boolean | null;
  reason?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  conflicts?: RawAvailabilityConflict[] | null;
  existingEvents?: RawAvailabilityConflict[] | null;
  suggestions?: Array<{ from?: string | null; to?: string | null } | Record<string, unknown>> | null;
}

export interface SpaceDailyOccupancyResponse {
  spaceId: number;
  date: string;
  blocks?: Array<{
    from?: string | null;
    to?: string | null;
    status?: EventStatus | string | null;
  }> | null;
}

function normalizeAvailabilityConflict(conflict: RawAvailabilityConflict): AvailabilityConflict {
  return {
    eventId: conflict.eventId ?? conflict.id ?? undefined,
    eventName: conflict.eventName ?? conflict.title ?? conflict.name ?? undefined,
    from: conflict.from ?? conflict.scheduleFrom ?? '',
    to: conflict.to ?? conflict.scheduleTo ?? '',
    status: conflict.status ?? undefined,
    priority: conflict.priority ?? undefined,
    bufferBefore: conflict.bufferBefore ?? conflict.bufferBeforeMin ?? undefined,
    bufferAfter: conflict.bufferAfter ?? conflict.bufferAfterMin ?? undefined,
  };
}

function normalizeSuggestions(
  suggestions: RawAvailabilityResponse['suggestions']
): Array<{ from: string; to: string }> {
  if (!Array.isArray(suggestions)) {
    return [];
  }

  return suggestions
    .map((suggestion) => ({
      from: typeof suggestion.from === 'string' ? suggestion.from : '',
      to: typeof suggestion.to === 'string' ? suggestion.to : '',
    }))
    .filter((suggestion) => suggestion.from && suggestion.to);
}

export function normalizeAvailabilityResponse(
  response: RawAvailabilityResponse
): AvailabilityResult {
  const rawAvailable = response.available ?? response.isAvailable;
  const skipped = response.skipped ?? false;
  const conflicts = (response.conflicts ?? response.existingEvents ?? [])
    .map(normalizeAvailabilityConflict)
    .filter((conflict) => conflict.from && conflict.to);
  const available = rawAvailable == null ? conflicts.length === 0 : rawAvailable;
  const suggestions = normalizeSuggestions(response.suggestions);

  let message = response.reason ?? '';
  if (!message) {
    if (skipped) {
      message = 'No se valida disponibilidad por recurso para esta ubicación';
    } else if (available) {
      message = 'Espacio disponible para la fecha y horario solicitado';
    } else {
      const count = conflicts.length;
      message = `Espacio no disponible (${count} ${count === 1 ? 'conflicto' : 'conflictos'})`;
    }
  }

  return {
    available,
    skipped,
    reason: response.reason ?? null,
    effectiveFrom: response.effectiveFrom ?? null,
    effectiveTo: response.effectiveTo ?? null,
    conflicts,
    suggestions,
    message,
  };
}

export function normalizeSpaceOccupancyResponse(
  response: SpaceDailyOccupancyResponse,
  fallback: { spaceId: number; date: string; spaceName?: string | null }
): SpaceOccupancyResult {
  const occupied = (response.blocks ?? [])
    .map((block) => ({
      from: block.from ?? '',
      to: block.to ?? '',
      status: block.status ?? null,
    }))
    .filter((block) => block.from && block.to);

  return {
    spaceId: response.spaceId ?? fallback.spaceId,
    spaceName: fallback.spaceName ?? null,
    date: response.date ?? fallback.date,
    occupied,
    availableSlots: [],
  };
}

// ==================== FUNCIONES DEL SDK ====================

/**
 * Verifica disponibilidad de un espacio en fecha/hora específica
 * Endpoint interno (requiere autenticación)
 * 
 * @param params - Parámetros de disponibilidad
 * @returns Resultado con disponibilidad y conflictos
 * 
 * @example
 * const result = await availabilityApi.checkAvailability({
 *   spaceId: 5,
 *   date: '2025-12-01',
 *   scheduleFrom: '09:00',
 *   scheduleTo: '11:00',
 *   bufferBeforeMin: 15,
 *   bufferAfterMin: 15
 * });
 * 
 * if (!result.available) {
 *   console.log('Conflictos:', result.conflicts);
 * }
 */
export async function checkAvailability(
  params: CheckAvailabilityParams
): Promise<AvailabilityResult> {
  // Normalizar fecha si viene como Date
  const date = typeof params.date === 'string' 
    ? params.date 
    : toBackendDate(params.date);

  const requestBody = {
    spaceId: params.spaceId,
    date,
    scheduleFrom: params.scheduleFrom,
    scheduleTo: params.scheduleTo,
    bufferBeforeMin: params.bufferBeforeMin,
    bufferAfterMin: params.bufferAfterMin,
    excludeEventId: params.excludeEventId
  };

  const response = await httpClient.post<RawAvailabilityResponse>(
    ENDPOINTS.AVAILABILITY_CHECK,
    requestBody
  );

  return normalizeAvailabilityResponse(response);
}

/**
 * Verifica disponibilidad pública (sin autenticación)
 * Endpoint público para solicitudes externas
 * 
 * @param params - Parámetros de disponibilidad
 * @returns Resultado con disponibilidad y conflictos
 * 
 * @example
 * const result = await availabilityApi.checkPublicAvailability({
 *   spaceId: 5,
 *   date: '2025-12-01',
 *   scheduleFrom: '09:00',
 *   scheduleTo: '11:00'
 * });
 */
export async function checkPublicAvailability(
  params: Omit<CheckAvailabilityParams, 'excludeEventId'>
): Promise<AvailabilityResult> {
  const date = typeof params.date === 'string' 
    ? params.date 
    : toBackendDate(params.date);

  const requestBody = {
    spaceId: params.spaceId,
    date,
    scheduleFrom: params.scheduleFrom,
    scheduleTo: params.scheduleTo,
    bufferBeforeMin: params.bufferBeforeMin,
    bufferAfterMin: params.bufferAfterMin
  };

  const response = await httpClient.post<RawAvailabilityResponse>(
    ENDPOINTS.AVAILABILITY_PUBLIC_CHECK,
    requestBody
  );

  return normalizeAvailabilityResponse(response);
}

/**
 * Obtiene la capacidad técnica disponible para una fecha específica
 * Endpoint interno (requiere permisos)
 * 
 * @param date - Fecha a consultar (yyyy-MM-dd o Date)
 * @returns Capacidad técnica con bloques horarios y resumen
 * 
 * @example
 * const capacity = await availabilityApi.getTechCapacity('2025-12-01');
 * 
 * console.log(`Capacidad máxima: ${capacity.maxCapacity}`);
 * console.log(`Utilización promedio: ${capacity.summary.averageUtilization}%`);
 * 
 * if (capacity.summary.hasOverCapacity) {
 *   console.warn(`⚠️ Sobrecapacidad en ${capacity.summary.peakTime}`);
 * }
 */
export async function getTechCapacity(
  date: string | Date
): Promise<TechCapacityResult> {
  const normalizedDate = typeof date === 'string' ? date : toBackendDate(date);

  const response = await httpClient.get<BackendTechnicalCapacityResponse>(
    `${ENDPOINTS.INTERNAL_TECH_CAPACITY}?date=${normalizedDate}`
  );

  const maxCapacity = response.maxCapacity ?? response.defaultSlots ?? 0;

  // Adaptar bloques con cálculos adicionales
  const blocks: TechCapacityBlock[] = response.blocks.map(block => {
    const time = block.time ?? block.from ?? '00:00';
    const from = block.from ?? time;
    const to = block.to ?? time;
    const utilizationPercent = maxCapacity > 0 
      ? Math.round((block.used / maxCapacity) * 100)
      : 0;
    
    return {
      time,
      from,
      to,
      used: block.used,
      available: block.available,
      utilizationPercent,
      isOverCapacity: block.available === 0
    };
  });

  // Calcular resumen
  const totalUsed = blocks.reduce((sum, b) => sum + b.used, 0);
  const totalAvailable = blocks.reduce((sum, b) => sum + b.available, 0);
  const avgUtilization = blocks.length > 0
    ? Math.round(blocks.reduce((sum, b) => sum + b.utilizationPercent, 0) / blocks.length)
    : 0;
  
  const peakBlock = blocks.reduce((max, b) => 
    b.utilizationPercent > max.utilizationPercent ? b : max,
    blocks[0] || { utilizationPercent: 0, time: '' }
  );

  const hasOverCapacity = blocks.some(b => b.isOverCapacity);

  return {
    date: response.date,
    maxCapacity,
    blocks,
    summary: {
      totalUsed,
      totalAvailable,
      averageUtilization: avgUtilization,
      peakUtilization: peakBlock.utilizationPercent,
      peakTime: peakBlock.time,
      hasOverCapacity
    }
  };
}

/**
 * Obtiene eventos con soporte técnico para una fecha específica
 * Endpoint interno (requiere permisos)
 * 
 * @param params - Parámetros con fecha
 * @returns Array de eventos con soporte técnico
 * 
 * @example
 * const events = await availabilityApi.getTechEvents({ 
 *   date: '2025-12-01' 
 * });
 * 
 * events.forEach(event => {
 *   console.log(`${event.name}: ${event.scheduleFrom} - ${event.scheduleTo}`);
 *   console.log(`Modo: ${event.techSupportMode}`);
 * });
 */
export async function getTechEvents(
  params: GetTechEventsParams
): Promise<TechSupportEvent[]> {
  const date = typeof params.date === 'string' 
    ? params.date 
    : toBackendDate(params.date);

  const events = await httpClient.get<TechSupportEvent[]>(
    `${ENDPOINTS.INTERNAL_TECH_EVENTS}?date=${date}`
  );

  return events;
}

/**
 * Obtiene la ocupación pública de un espacio para una fecha
 * Endpoint público (sin autenticación)
 * 
 * @param params - Parámetros con spaceId y date
 * @returns Slots ocupados y disponibles
 * 
 * @example
 * const occupancy = await availabilityApi.getPublicSpaceOccupancy({
 *   spaceId: 5,
 *   date: '2025-12-01'
 * });
 * 
 * console.log('Horarios ocupados:');
 * occupancy.occupied.forEach(slot => {
 *   console.log(`${slot.from} - ${slot.to}: ${slot.eventName || 'Reservado'}`);
 * });
 * 
 * console.log('Horarios disponibles:');
 * occupancy.availableSlots.forEach(slot => {
 *   console.log(`${slot.from} - ${slot.to}`);
 * });
 */
export async function getPublicSpaceOccupancy(
  params: GetSpaceOccupancyParams
): Promise<SpaceOccupancyResult> {
  const date = typeof params.date === 'string' 
    ? params.date 
    : toBackendDate(params.date);

  const response = await httpClient.get<SpaceDailyOccupancyResponse>(
    ENDPOINTS.PUBLIC_SPACE_OCCUPANCY(params.spaceId),
    {
      params: { date },
    }
  );

  return normalizeSpaceOccupancyResponse(response, {
    spaceId: params.spaceId,
    date,
  });
}

/**
 * Verifica si hay capacidad técnica suficiente para un evento
 * Wrapper conveniente sobre getTechCapacity
 * 
 * @param date - Fecha del evento
 * @param scheduleFrom - Hora inicio (HH:mm)
 * @param scheduleTo - Hora fin (HH:mm)
 * @returns true si hay capacidad suficiente
 * 
 * @example
 * const hasCapacity = await availabilityApi.hasTechCapacity(
 *   '2025-12-01',
 *   '09:00',
 *   '11:00'
 * );
 * 
 * if (!hasCapacity) {
 *   alert('⚠️ Sin capacidad técnica disponible');
 * }
 */
export async function hasTechCapacity(
  date: string | Date,
  scheduleFrom: string,
  scheduleTo: string
): Promise<boolean> {
  const capacity = await getTechCapacity(date);
  
  // Filtrar bloques en el rango horario del evento
  const eventBlocks = capacity.blocks.filter(block => {
    return block.from < scheduleTo && block.to > scheduleFrom;
  });

  // Verificar que ninguno esté sobre capacidad
  return !eventBlocks.some(block => block.isOverCapacity);
}

/**
 * Obtiene los bloques con mayor utilización técnica en una fecha
 * 
 * @param date - Fecha a analizar
 * @param topN - Cantidad de bloques a retornar (default: 5)
 * @returns Bloques ordenados por utilización descendente
 * 
 * @example
 * const busyBlocks = await availabilityApi.getTopUtilizedBlocks('2025-12-01', 3);
 * busyBlocks.forEach(block => {
 *   console.log(`${block.time}: ${block.utilizationPercent}%`);
 * });
 */
export async function getTopUtilizedBlocks(
  date: string | Date,
  topN: number = 5
): Promise<TechCapacityBlock[]> {
  const capacity = await getTechCapacity(date);
  
  return capacity.blocks
    .sort((a, b) => b.utilizationPercent - a.utilizationPercent)
    .slice(0, topN);
}

/**
 * Encuentra el primer slot disponible en un espacio para una duración específica
 * 
 * @param spaceId - ID del espacio
 * @param date - Fecha a buscar
 * @param durationMinutes - Duración del evento en minutos
 * @param startFrom - Hora mínima desde donde buscar (default: '08:00')
 * @param endBy - Hora máxima hasta donde buscar (default: '20:00')
 * @returns Primer slot disponible o null
 * 
 * @example
 * const slot = await availabilityApi.findFirstAvailableSlot(
 *   5, 
 *   '2025-12-01', 
 *   120, // 2 horas
 *   '09:00',
 *   '18:00'
 * );
 * 
 * if (slot) {
 *   console.log(`Disponible: ${slot.from} - ${slot.to}`);
 * }
 */
export async function findFirstAvailableSlot(
  spaceId: number,
  date: string | Date,
  durationMinutes: number,
  startFrom: string = '08:00',
  endBy: string = '20:00'
): Promise<{ from: string; to: string } | null> {
  const normalizedDate = typeof date === 'string' ? date : toBackendDate(date);
  const occupancy = await getPublicSpaceOccupancy({ spaceId, date: normalizedDate });
  
  // Buscar en los slots disponibles uno que cumpla con la duración
  for (const slot of occupancy.availableSlots) {
    // Calcular duración del slot
    const [fromH, fromM] = slot.from.split(':').map(Number);
    const [toH, toM] = slot.to.split(':').map(Number);
    const slotDuration = (toH * 60 + toM) - (fromH * 60 + fromM);
    
    // Verificar que el slot esté en el rango solicitado
    if (slot.from >= startFrom && slot.to <= endBy && slotDuration >= durationMinutes) {
      // Calcular el fin del evento dentro del slot
      const eventEnd = new Date(0, 0, 0, fromH, fromM + durationMinutes);
      const eventEndStr = `${String(eventEnd.getHours()).padStart(2, '0')}:${String(eventEnd.getMinutes()).padStart(2, '0')}`;
      
      return {
        from: slot.from,
        to: eventEndStr
      };
    }
  }
  
  return null;
}

// ==================== EXPORT DEFAULT ====================

/**
 * API de Disponibilidad y Capacidad Técnica - Objeto con todas las funciones
 * Permite importar como: import { availabilityApi } from '@/services/api'
 */
export const availabilityApi = {
  checkAvailability,
  checkPublicAvailability,
  getTechCapacity,
  getTechEvents,
  getPublicSpaceOccupancy,
  hasTechCapacity,
  getTopUtilizedBlocks,
  findFirstAvailableSlot
};

export default availabilityApi;
