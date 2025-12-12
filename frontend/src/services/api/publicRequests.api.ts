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
import type { SpringPageResponse, PageResponse } from './types/pagination.types';
import { adaptSpringPage } from './adapters/pagination.adapter';
import type {
  PublicEventRequest,
  PublicRequestsQueryParams,
} from '@/models/public-request';

// ============================================================
// TIPO: FILTROS PARA ESPACIOS PÚBLICOS
// ============================================================
export interface PublicSpacesFilters {
  /** Solo espacios publicables */
  publishableOnly?: boolean;
}

// ==================== TIPOS DEL BACKEND ====================

/**
 * DTO de respuesta del backend para solicitudes de eventos
 */
interface BackendEventRequestResponseDto {
  id: number;
  trackingUuid: string;
  status: string;
  
  // Información del evento
  name: string;
  audienceType: string;
  date: string;
  scheduleFrom: string;
  scheduleTo: string;
  technicalSchedule: string | null;
  
  // Ubicación
  space: {
    id: number;
    name: string;
    capacity?: number;
    colorHex?: string;
  } | null;
  freeLocation: string | null;
  
  // Departamento
  requestingDepartment: {
    id: number;
    name: string;
    colorHex?: string;
  } | null;
  
  // Contacto
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  
  // Buffers
  bufferBeforeMin: number;
  bufferAfterMin: number;
  
  // Técnica
  requiresTech: boolean;
  techSupportMode: string | null;
  
  // Observaciones
  requirements: string | null;
  coverage: string | null;
  observations: string | null;
  
  // Metadata
  requestDate: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== ADAPTADORES ====================

/**
 * Adapta una solicitud del backend al modelo del frontend
 */
function adaptRequestFromBackend(
  dto: BackendEventRequestResponseDto
): PublicEventRequest {
  return {
    id: dto.id,
    trackingUuid: dto.trackingUuid,
    status: dto.status as PublicEventRequest['status'],
    name: dto.name,
    audienceType: dto.audienceType as PublicEventRequest['audienceType'],
    date: dto.date,
    scheduleFrom: dto.scheduleFrom,
    scheduleTo: dto.scheduleTo,
    technicalSchedule: dto.technicalSchedule,
    space: dto.space,
    freeLocation: dto.freeLocation,
    requestingDepartment: dto.requestingDepartment,
    contactName: dto.contactName,
    contactEmail: dto.contactEmail,
    contactPhone: dto.contactPhone,
    bufferBeforeMin: dto.bufferBeforeMin,
    bufferAfterMin: dto.bufferAfterMin,
    requiresTech: dto.requiresTech,
    techSupportMode: dto.techSupportMode as PublicEventRequest['techSupportMode'],
    requirements: dto.requirements,
    coverage: dto.coverage,
    observations: dto.observations,
    requestDate: dto.requestDate,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

// ============================================================
// 1. LISTAR SOLICITUDES DE EVENTOS (ADMIN)
// ============================================================
/**
 * Obtiene solicitudes públicas paginadas (endpoint protegido para admin).
 * 
 * Características:
 * - Requiere autenticación
 * - Retorna solicitudes activas paginadas
 * - Soporta ordenamiento por múltiples campos
 * 
 * @param params - Parámetros de paginación y ordenamiento
 * @returns Página de solicitudes
 * 
 * @example
 * ```ts
 * const requests = await getPublicRequests({
 *   page: 0,
 *   size: 20,
 *   sort: 'requestDate,desc'
 * });
 * ```
 */
export const getPublicRequests = async (
  params?: PublicRequestsQueryParams
): Promise<PageResponse<PublicEventRequest>> => {
  const queryParams = new URLSearchParams();

  // Siempre enviar parámetros de paginación para obtener respuesta Page
  const page = params?.page !== undefined ? params.page : 0;
  const size = params?.size !== undefined ? params.size : 20;
  
  queryParams.append('page', page.toString());
  queryParams.append('size', size.toString());
  
  if (params?.sort) {
    queryParams.append('sort', params.sort);
  }

  const url = `/public/event-requests?${queryParams.toString()}`;
  
  // httpClient.get() ya devuelve response.data directamente
  const data = await httpClient.get<SpringPageResponse<BackendEventRequestResponseDto>>(url);
  
  return adaptSpringPage(data, adaptRequestFromBackend);
};

/**
 * Obtiene una solicitud pública por ID.
 * 
 * @param id - ID de la solicitud
 * @returns Solicitud completa
 */
export const getPublicRequestById = async (
  id: number
): Promise<PublicEventRequest> => {
  const response = await httpClient.get<BackendEventRequestResponseDto>(
    `/public/event-requests/${id}`
  );
  
  return adaptRequestFromBackend(response.data);
};

// ============================================================
// 2. CREAR SOLICITUD DE EVENTO PÚBLICO
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
// 3. CONSULTAR ESTADO DE SOLICITUD (TRACKING)
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
// 4. VERIFICAR DISPONIBILIDAD DE ESPACIO
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
// 5. LISTAR ESPACIOS PÚBLICOS
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
    `/public/catalogs/spaces${params.toString() ? `?${params.toString()}` : ''}`
  );
};

// ============================================================
// 6. CONSULTAR OCUPACIÓN MENSUAL DE ESPACIO
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
  getPublicRequests,
  getPublicRequestById,
  createPublicEventRequest,
  trackPublicEventRequest,
  checkPublicAvailability,
  getPublicSpaces,
  getSpaceMonthlyOccupancy,
};

export default publicRequestsApi;
