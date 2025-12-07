import { httpClient } from './client';
import type {
  PublicEventRequestPayload,
  EventRequestCreatedResponse,
  EventRequestStatusResponse,
  AvailabilityCheckRequest,
  AvailabilityCheckResponse,
  PublicSpaceListItem,
  SpaceOccupancyResponse,
} from './types/backend.types';

// ============================================================
// TIPO: FILTROS PARA ESPACIOS PÚBLICOS
// ============================================================
export interface PublicSpacesFilters {
  /** Solo espacios publicables */
  publishableOnly?: boolean;
}

// ============================================================
// 1. CREAR SOLICITUD DE EVENTO PÚBLICO
// ============================================================
/**
 * Crea una nueva solicitud de evento público.
 * 
 * Características:
 * - NO requiere autenticación (endpoint público)
 * - Genera UUID automáticamente para tracking
 * - Prioridad siempre es MEDIUM
 * - Estado inicial: SOLICITADO
 * 
 * @param payload - Datos de la solicitud
 * @returns Respuesta con UUID de tracking
 * @throws Error si los datos son inválidos o el servidor falla
 * 
 * @example
 * ```ts
 * const response = await createPublicEventRequest({
 *   name: 'Conferencia de Innovación',
 *   audienceType: 'OPEN',
 *   date: '2025-06-15',
 *   scheduleFrom: '09:00',
 *   scheduleTo: '13:00',
 *   spaceId: 5,
 *   contactName: 'María García',
 *   contactEmail: 'maria@example.com',
 *   contactPhone: '+54 11 1234-5678',
 *   bufferBeforeMin: 15,
 *   bufferAfterMin: 15,
 * });
 * 
 * console.log(`Tracking UUID: ${response.trackingUuid}`);
 * // Guardar UUID para consultas posteriores
 * ```
 */
export const createPublicEventRequest = async (
  payload: PublicEventRequestPayload
): Promise<EventRequestCreatedResponse> => {
  return await httpClient.post<EventRequestCreatedResponse>(
    '/public/event-requests',
    payload
  );
};

// ============================================================
// 2. CONSULTAR ESTADO DE SOLICITUD (TRACKING)
// ============================================================
/**
 * Consulta el estado actual de una solicitud mediante su UUID.
 * 
 * Características:
 * - NO requiere autenticación (endpoint público)
 * - Solo necesita el UUID de tracking
 * - Retorna historial de cambios de estado
 * - Incluye comentarios si los hay
 * 
 * @param trackingUuid - UUID de tracking (generado al crear solicitud)
 * @returns Estado actual y detalles de la solicitud
 * @throws Error si el UUID no existe
 * 
 * @example
 * ```ts
 * const status = await trackPublicEventRequest(
 *   '3f8d7c5b-9e2a-4b1f-8c7d-5e6f9a0b1c2d'
 * );
 * 
 * console.log(`Estado: ${status.currentStatus}`);
 * console.log(`Última actualización: ${status.lastUpdatedAt}`);
 * 
 * if (status.comments) {
 *   console.log(`Comentarios: ${status.comments}`);
 * }
 * ```
 */
export const trackPublicEventRequest = async (
  trackingUuid: string
): Promise<EventRequestStatusResponse> => {
  return await httpClient.get<EventRequestStatusResponse>(
    `/public/track/${trackingUuid}`
  );
};

// ============================================================
// 3. VERIFICAR DISPONIBILIDAD DE ESPACIO
// ============================================================
/**
 * Verifica si un espacio está disponible en fecha/hora específica.
 * 
 * Características:
 * - NO requiere autenticación (endpoint público)
 * - Considera horarios técnicos y buffers
 * - Retorna ocupación actual y detalles de conflictos
 * - Puede verificar espacio específico o ubicación libre
 * 
 * @param checkRequest - Datos de fecha, hora y espacio a verificar
 * @returns Disponibilidad y detalles de ocupación
 * 
 * @example
 * ```ts
 * // Verificar disponibilidad de espacio específico
 * const availability = await checkPublicAvailability({
 *   date: '2025-06-15',
 *   scheduleFrom: '09:00',
 *   scheduleTo: '13:00',
 *   spaceId: 5,
 *   bufferBeforeMin: 15,
 *   bufferAfterMin: 15,
 * });
 * 
 * if (availability.available) {
 *   console.log('✓ Espacio disponible');
 * } else {
 *   console.log('✗ Conflicto:', availability.reason);
 *   console.log('Eventos existentes:', availability.existingEvents);
 * }
 * 
 * // Verificar ubicación libre (sin spaceId)
 * const freeLocationCheck = await checkPublicAvailability({
 *   date: '2025-06-15',
 *   scheduleFrom: '09:00',
 *   scheduleTo: '13:00',
 *   freeLocation: 'Campus Norte - Jardines',
 * });
 * ```
 */
export const checkPublicAvailability = async (
  checkRequest: AvailabilityCheckRequest
): Promise<AvailabilityCheckResponse> => {
  return await httpClient.post<AvailabilityCheckResponse>(
    '/public/availability/check',
    checkRequest
  );
};

// ============================================================
// 4. LISTAR ESPACIOS PÚBLICOS
// ============================================================
/**
 * Obtiene lista de espacios disponibles para solicitudes públicas.
 * 
 * Características:
 * - NO requiere autenticación (endpoint público)
 * - Solo retorna espacios con `publishable = true`
 * - Incluye capacidad y disponibilidad general
 * - Ordenado por nombre
 * 
 * @param filters - Filtros opcionales (actualmente solo publishableOnly)
 * @returns Lista de espacios públicos
 * 
 * @example
 * ```ts
 * const spaces = await getPublicSpaces({ publishableOnly: true });
 * 
 * spaces.forEach(space => {
 *   console.log(`${space.name} - Capacidad: ${space.capacity}`);
 *   console.log(`  Ubicación: ${space.location || 'No especificada'}`);
 *   console.log(`  Activo: ${space.active ? 'Sí' : 'No'}`);
 * });
 * ```
 */
export const getPublicSpaces = async (
  filters?: PublicSpacesFilters
): Promise<PublicSpaceListItem[]> => {
  const params = new URLSearchParams();

  // Por defecto, solo espacios publicables
  if (filters?.publishableOnly !== false) {
    params.append('publishableOnly', 'true');
  }

  return await httpClient.get<PublicSpaceListItem[]>(
    `/api/catalogs/spaces/public${params.toString() ? `?${params.toString()}` : ''}`
  );
};

// ============================================================
// 5. CONSULTAR OCUPACIÓN MENSUAL DE ESPACIO
// ============================================================
/**
 * Obtiene la ocupación mensual de un espacio específico.
 * 
 * Características:
 * - NO requiere autenticación (endpoint público)
 * - Retorna eventos del mes especificado
 * - Útil para mostrar calendarios de disponibilidad
 * - Incluye horarios técnicos y buffers
 * 
 * @param spaceId - ID del espacio a consultar
 * @param year - Año (formato: yyyy, ej: 2025)
 * @param month - Mes (formato: MM, ej: 06 para junio)
 * @returns Lista de eventos en el mes especificado
 * 
 * @example
 * ```ts
 * // Consultar ocupación del Auditorio Principal en junio 2025
 * const occupancy = await getSpaceMonthlyOccupancy(5, 2025, 6);
 * 
 * console.log(`Total de eventos: ${occupancy.events.length}`);
 * 
 * occupancy.events.forEach(event => {
 *   console.log(`${event.date} ${event.scheduleFrom}-${event.scheduleTo}`);
 *   console.log(`  ${event.eventName || 'Sin nombre'}`);
 *   console.log(`  Estado: ${event.status}`);
 * });
 * ```
 */
export const getSpaceMonthlyOccupancy = async (
  spaceId: number,
  year: number,
  month: number
): Promise<SpaceOccupancyResponse> => {
  return await httpClient.get<SpaceOccupancyResponse>(
    `/public/spaces/${spaceId}/occupancy`,
    {
      params: { year, month },
    }
  );
};

// ============================================================
// EXPORTS
// ============================================================
export const publicRequestsApi = {
  createPublicEventRequest,
  trackPublicEventRequest,
  checkPublicAvailability,
  getPublicSpaces,
  getSpaceMonthlyOccupancy,
};

export default publicRequestsApi;
