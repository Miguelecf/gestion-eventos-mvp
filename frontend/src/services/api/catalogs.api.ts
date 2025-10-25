/**
 * ===================================================================
 * SDK DE CONFLICTOS, PRIORIDAD Y CATÁLOGOS - API DE ALTO NIVEL
 * ===================================================================
 * Proporciona funciones para gestionar conflictos de prioridad,
 * espacios y departamentos (catálogos).
 * ===================================================================
 */

import { httpClient } from './client';
import { ENDPOINTS } from './client/config';
import type { 
  BackendPriorityConflictsResponse,
  BackendPriorityDecisionDTO,
  BackendPriorityDecisionResult,
  BackendSpaceDTO,
  BackendDepartmentDTO,
  BackendSubmitPublicRequestDTO,
  BackendSubmitPublicRequestResponse,
  BackendPublicTrackingResponse,
  PriorityConflictStatus,
  ConflictDecision,
  BackendPageResponse
} from './types/backend.types';

// ==================== TIPOS ESPECÍFICOS DEL SDK ====================

/**
 * Conflicto de prioridad adaptado
 */
export interface PriorityConflict {
  conflictCode: string;
  displacedEventId: number;
  displacedEventName: string;
  displacedEventDate: string; // yyyy-MM-dd
  displacedEventTime: string; // "HH:mm - HH:mm"
  status: PriorityConflictStatus;
  createdAt: Date;
  // Helpers
  isResolved: boolean;
  isPending: boolean;
  timeAgo: string;
}

/**
 * Resultado de consulta de conflictos
 */
export interface ConflictsResult {
  eventId: number;
  conflicts: PriorityConflict[];
  hasConflicts: boolean;
  pendingCount: number;
  resolvedCount: number;
}

/**
 * Parámetros para obtener conflictos
 */
export interface GetConflictsParams {
  eventId: number;
}

/**
 * Parámetros para tomar decisión sobre conflicto
 */
export interface MakeDecisionParams {
  conflictCode: string;
  decision: ConflictDecision;
  target: 'DISPLACING_EVENT' | 'DISPLACED_EVENT';
}

/**
 * Resultado de decisión de conflicto
 */
export interface DecisionResult {
  conflictCode: string;
  decision: ConflictDecision;
  status: 'RESOLVED';
  message: string;
}

/**
 * Espacio (catálogo) adaptado
 */
export interface Space {
  id: number;
  name: string;
  capacity: number;
  location: string;
  description: string;
  colorHex: string;
  defaultBufferBeforeMin: number;
  defaultBufferAfterMin: number;
  active: boolean;
  // Helpers
  label: string; // "Nombre - Ubicación (Cap: X)"
  isAvailable: boolean; // alias de active
}

/**
 * Departamento (catálogo) adaptado
 */
export interface Department {
  id: number;
  name: string;
  description: string;
  colorHex: string;
  active: boolean;
  // Helpers
  isAvailable: boolean; // alias de active
}

/**
 * Parámetros para solicitud pública de evento
 */
export interface PublicEventRequestInput {
  // Datos del evento
  eventName: string;
  eventDescription: string;
  date: string; // yyyy-MM-dd
  scheduleFrom: string; // HH:mm
  scheduleTo: string; // HH:mm
  expectedAttendees: number;
  audienceType: string;
  
  // Datos del solicitante
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  
  // Preferencias
  spaceId?: number;
  departmentId?: number;
  requiresTech: boolean;
}

/**
 * Resultado de solicitud pública
 */
export interface PublicRequestResult {
  trackingUuid: string;
  message: string;
  nextSteps: string[];
}

/**
 * Estado de seguimiento público
 */
export interface PublicTrackingResult {
  trackingUuid: string;
  eventName: string;
  status: string;
  submittedAt: Date;
  lastUpdate: Date;
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    note?: string;
  }>;
  canEdit: boolean;
  canCancel: boolean;
}

// ==================== FUNCIONES DE CONFLICTOS DE PRIORIDAD ====================

/**
 * Obtiene conflictos de prioridad para un evento
 * Endpoint interno (requiere permisos de admin)
 * 
 * @param params - Parámetros con eventId
 * @returns Conflictos del evento
 * 
 * @example
 * const result = await catalogsApi.getConflicts({ eventId: 123 });
 * 
 * if (result.hasConflicts) {
 *   console.log(`${result.pendingCount} conflictos pendientes`);
 *   result.conflicts.forEach(c => {
 *     console.log(`- ${c.displacedEventName} (${c.status})`);
 *   });
 * }
 */
export async function getConflicts(
  params: GetConflictsParams
): Promise<ConflictsResult> {
  const response = await httpClient.get<BackendPriorityConflictsResponse>(
    `${ENDPOINTS.INTERNAL_PRIORITY_CONFLICTS}?eventId=${params.eventId}`
  );

  // Adaptar conflictos
  const conflicts: PriorityConflict[] = response.conflicts.map(conflict => {
    const createdAt = new Date(conflict.createdAt);
    const isResolved = conflict.status === 'RESOLVED';
    const isPending = conflict.status === 'PENDING';
    
    // Calcular "tiempo atrás"
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    let timeAgo = '';
    if (diffDays > 0) {
      timeAgo = `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      timeAgo = `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffMins > 0) {
      timeAgo = `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    } else {
      timeAgo = 'hace instantes';
    }

    return {
      conflictCode: conflict.conflictCode,
      displacedEventId: conflict.displacedEventId,
      displacedEventName: conflict.displacedEventName,
      displacedEventDate: conflict.displacedEventDate,
      displacedEventTime: conflict.displacedEventTime,
      status: conflict.status,
      createdAt,
      isResolved,
      isPending,
      timeAgo
    };
  });

  const pendingCount = conflicts.filter(c => c.isPending).length;
  const resolvedCount = conflicts.filter(c => c.isResolved).length;

  return {
    eventId: response.eventId,
    conflicts,
    hasConflicts: conflicts.length > 0,
    pendingCount,
    resolvedCount
  };
}

/**
 * Registra una decisión sobre un conflicto de prioridad
 * Endpoint interno (requiere permisos de admin)
 * 
 * @param params - Parámetros de decisión
 * @returns Resultado de la decisión
 * 
 * @example
 * const result = await catalogsApi.makeDecision({
 *   conflictCode: 'CONF-2025-001',
 *   decision: 'KEEP_NEW',
 *   target: 'DISPLACING_EVENT'
 * });
 * 
 * console.log(result.message);
 */
export async function makeDecision(
  params: MakeDecisionParams
): Promise<DecisionResult> {
  const requestBody: BackendPriorityDecisionDTO = {
    conflictCode: params.conflictCode,
    decision: params.decision,
    target: params.target
  };

  const response = await httpClient.post<BackendPriorityDecisionResult>(
    ENDPOINTS.INTERNAL_PRIORITY_DECISIONS,
    requestBody
  );

  let message = '';
  if (response.decision === 'KEEP_NEW') {
    message = '✅ Se mantiene el nuevo evento. El evento desplazado será rechazado.';
  } else {
    message = '✅ Se mantiene el evento existente. El nuevo evento será rechazado.';
  }

  return {
    conflictCode: response.conflictCode,
    decision: response.decision,
    status: response.status,
    message
  };
}

/**
 * Resuelve múltiples conflictos en lote
 * 
 * @param decisions - Array de decisiones
 * @returns Array de resultados
 * 
 * @example
 * const results = await catalogsApi.resolveMultipleConflicts([
 *   { conflictCode: 'CONF-001', decision: 'KEEP_NEW', target: 'DISPLACING_EVENT' },
 *   { conflictCode: 'CONF-002', decision: 'KEEP_DISPLACED', target: 'DISPLACED_EVENT' }
 * ]);
 */
export async function resolveMultipleConflicts(
  decisions: MakeDecisionParams[]
): Promise<DecisionResult[]> {
  const results: DecisionResult[] = [];
  
  for (const decision of decisions) {
    try {
      const result = await makeDecision(decision);
      results.push(result);
    } catch (error) {
      // Continuar con los demás aunque uno falle
      console.error(`Error resolviendo ${decision.conflictCode}:`, error);
    }
  }
  
  return results;
}

// ==================== FUNCIONES DE CATÁLOGOS ====================

/**
 * Obtiene todos los espacios disponibles
 * 
 * @param includeInactive - Incluir espacios inactivos (default: false)
 * @returns Array de espacios
 * 
 * @example
 * const spaces = await catalogsApi.getSpaces();
 * spaces.forEach(space => {
 *   console.log(`${space.name} - Cap: ${space.capacity}`);
 * });
 */
export async function getSpaces(
  includeInactive: boolean = false
): Promise<Space[]> {
  // Verificar si el backend también devuelve Page<SpaceResponse>
  const response = await httpClient.get<BackendPageResponse<BackendSpaceDTO>>(
    ENDPOINTS.CATALOG_SPACES
  );

  const backendSpaces = response.content;

  const spaces: Space[] = backendSpaces.map(space => ({
    id: space.id,
    name: space.name,
    capacity: space.capacity,
    location: space.location,
    description: space.description,
    colorHex: space.colorHex,
    defaultBufferBeforeMin: space.defaultBufferBeforeMin,
    defaultBufferAfterMin: space.defaultBufferAfterMin,
    active: space.active,
    label: `${space.name} - ${space.location} (Cap: ${space.capacity})`,
    isAvailable: space.active
  }));

  return includeInactive ? spaces : spaces.filter(s => s.active);
}

/**
 * Obtiene espacios públicos (sin autenticación)
 * 
 * @returns Array de espacios públicos activos
 * 
 * @example
 * const publicSpaces = await catalogsApi.getPublicSpaces();
 */
export async function getPublicSpaces(): Promise<Space[]> {
  const response = await httpClient.get<BackendPageResponse<BackendSpaceDTO>>(
    ENDPOINTS.CATALOG_SPACES_PUBLIC
  );

  const backendSpaces = response.content;

  return backendSpaces.map(space => ({
    id: space.id,
    name: space.name,
    capacity: space.capacity,
    location: space.location,
    description: space.description,
    colorHex: space.colorHex,
    defaultBufferBeforeMin: space.defaultBufferBeforeMin,
    defaultBufferAfterMin: space.defaultBufferAfterMin,
    active: space.active,
    label: `${space.name} - ${space.location} (Cap: ${space.capacity})`,
    isAvailable: space.active
  }));
}

/**
 * Obtiene un espacio por ID
 * 
 * @param id - ID del espacio
 * @returns Espacio
 * 
 * @example
 * const space = await catalogsApi.getSpaceById(5);
 * console.log(space.name, space.capacity);
 */
export async function getSpaceById(id: number): Promise<Space> {
  const backendSpace = await httpClient.get<BackendSpaceDTO>(
    ENDPOINTS.CATALOG_SPACE_BY_ID(id)
  );

  return {
    id: backendSpace.id,
    name: backendSpace.name,
    capacity: backendSpace.capacity,
    location: backendSpace.location,
    description: backendSpace.description,
    colorHex: backendSpace.colorHex,
    defaultBufferBeforeMin: backendSpace.defaultBufferBeforeMin,
    defaultBufferAfterMin: backendSpace.defaultBufferAfterMin,
    active: backendSpace.active,
    label: `${backendSpace.name} - ${backendSpace.location} (Cap: ${backendSpace.capacity})`,
    isAvailable: backendSpace.active
  };
}

/**
 * Obtiene todos los departamentos disponibles
 * 
 * @param includeInactive - Incluir departamentos inactivos (default: false)
 * @returns Array de departamentos
 * 
 * @example
 * const departments = await catalogsApi.getDepartments();
 * departments.forEach(dept => {
 *   console.log(dept.name);
 * });
 */
export async function getDepartments(
  includeInactive: boolean = false
): Promise<Department[]> {
  // El backend devuelve Page<DepartmentResponse>
  const response = await httpClient.get<BackendPageResponse<BackendDepartmentDTO>>(
    ENDPOINTS.CATALOG_DEPARTMENTS
  );

  // Extraer el array del objeto paginado
  const backendDepartments = response.content;

  const departments: Department[] = backendDepartments.map(dept => ({
    id: dept.id,
    name: dept.name,
    description: '', // Backend no devuelve description
    colorHex: dept.colorHex || '#6B7280', // Color por defecto si es null
    active: dept.active,
    isAvailable: dept.active
  }));

  return includeInactive ? departments : departments.filter(d => d.active);
}

/**
 * Obtiene un departamento por ID
 * 
 * @param id - ID del departamento
 * @returns Departamento
 * 
 * @example
 * const dept = await catalogsApi.getDepartmentById(10);
 * console.log(dept.name);
 */
export async function getDepartmentById(id: number): Promise<Department> {
  const backendDept = await httpClient.get<BackendDepartmentDTO>(
    ENDPOINTS.CATALOG_DEPARTMENT_BY_ID(id)
  );

  return {
    id: backendDept.id,
    name: backendDept.name,
    description: '', // Backend no devuelve description,
    colorHex: backendDept.colorHex,
    active: backendDept.active,
    isAvailable: backendDept.active
  };
}

// ==================== FUNCIONES DE SOLICITUDES PÚBLICAS ====================

/**
 * Envía una solicitud pública de evento
 * Endpoint público (sin autenticación)
 * 
 * @param input - Datos de la solicitud
 * @returns Resultado con UUID de seguimiento
 * 
 * @example
 * const result = await catalogsApi.submitPublicRequest({
 *   eventName: 'Conferencia Tecnología',
 *   eventDescription: 'Charla sobre IA',
 *   date: '2025-12-15',
 *   scheduleFrom: '10:00',
 *   scheduleTo: '12:00',
 *   expectedAttendees: 50,
 *   audienceType: 'COMUNIDAD',
 *   contactName: 'Juan Pérez',
 *   contactEmail: 'juan@example.com',
 *   contactPhone: '+54911234567',
 *   spaceId: 5,
 *   requiresTech: true
 * });
 * 
 * console.log(`Código de seguimiento: ${result.trackingUuid}`);
 */
export async function submitPublicRequest(
  input: PublicEventRequestInput
): Promise<PublicRequestResult> {
  const requestBody: BackendSubmitPublicRequestDTO = {
    name: input.eventName,
    date: input.date,
    scheduleFrom: input.scheduleFrom,
    scheduleTo: input.scheduleTo,
    audienceType: input.audienceType as any,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    spaceId: input.spaceId ?? null,
    freeLocation: null,
    requestingDepartmentId: input.departmentId ?? null,
    requirements: input.eventDescription,
    priority: 'MEDIUM', // Default para solicitudes públicas
    bufferBeforeMin: 15,
    bufferAfterMin: 15
  };

  const response = await httpClient.post<BackendSubmitPublicRequestResponse>(
    ENDPOINTS.PUBLIC_EVENT_REQUESTS,
    requestBody
  );

  return {
    trackingUuid: response.trackingUuid,
    message: '✅ Solicitud enviada exitosamente',
    nextSteps: [
      `Guarda este código de seguimiento: ${response.trackingUuid}`,
      'Recibirás un email de confirmación',
      'Puedes consultar el estado en cualquier momento',
      'Te notificaremos cuando se procese tu solicitud'
    ]
  };
}

/**
 * Consulta el estado de una solicitud pública
 * Endpoint público (sin autenticación)
 * 
 * @param trackingUuid - UUID de seguimiento
 * @returns Estado de la solicitud
 * 
 * @example
 * const status = await catalogsApi.trackPublicRequest(
 *   'uuid-abc-123'
 * );
 * 
 * console.log(`Estado: ${status.status}`);
 * console.log(`Última actualización: ${status.lastUpdate}`);
 */
export async function trackPublicRequest(
  trackingUuid: string
): Promise<PublicTrackingResult> {
  const response = await httpClient.get<BackendPublicTrackingResponse>(
    ENDPOINTS.PUBLIC_TRACK(trackingUuid)
  );

  // Adaptamos la respuesta del backend
  const eventName = response.eventDetails?.name || 'Solicitud de evento';
  const status = response.requestStatus;
  
  // Última actualización es el último registro del historial
  const lastHistoryEntry = response.statusHistory[response.statusHistory.length - 1];
  const lastUpdate = lastHistoryEntry 
    ? new Date(lastHistoryEntry.timestamp)
    : new Date(response.submittedAt);

  // Determinar si se puede editar o cancelar basado en el estado
  const canEdit = response.requestStatus === 'RECEIVED';
  const canCancel = response.requestStatus === 'RECEIVED';

  return {
    trackingUuid: response.trackingUuid,
    eventName,
    status,
    submittedAt: new Date(response.submittedAt),
    lastUpdate,
    statusHistory: response.statusHistory.map(h => ({
      status: h.status,
      timestamp: new Date(h.timestamp),
      note: h.description
    })),
    canEdit,
    canCancel
  };
}

// ==================== HELPERS Y UTILIDADES ====================

/**
 * Obtiene espacios agrupados por capacidad
 * 
 * @returns Espacios organizados por rango de capacidad
 * 
 * @example
 * const grouped = await catalogsApi.getSpacesByCapacity();
 * console.log('Pequeños:', grouped.small.map(s => s.name));
 * console.log('Medianos:', grouped.medium.map(s => s.name));
 * console.log('Grandes:', grouped.large.map(s => s.name));
 */
export async function getSpacesByCapacity(): Promise<{
  small: Space[];  // < 30 personas
  medium: Space[]; // 30-100 personas
  large: Space[];  // > 100 personas
}> {
  const spaces = await getSpaces();
  
  return {
    small: spaces.filter(s => s.capacity < 30),
    medium: spaces.filter(s => s.capacity >= 30 && s.capacity <= 100),
    large: spaces.filter(s => s.capacity > 100)
  };
}

/**
 * Encuentra el espacio más adecuado para un número de asistentes
 * 
 * @param expectedAttendees - Número esperado de asistentes
 * @param buffer - Porcentaje de buffer adicional (default: 1.1 = 10%)
 * @returns Espacio más apropiado o null
 * 
 * @example
 * const space = await catalogsApi.findBestSpace(45);
 * if (space) {
 *   console.log(`Recomendado: ${space.name} (Cap: ${space.capacity})`);
 * }
 */
export async function findBestSpace(
  expectedAttendees: number,
  buffer: number = 1.1
): Promise<Space | null> {
  const spaces = await getSpaces();
  const requiredCapacity = Math.ceil(expectedAttendees * buffer);
  
  // Filtrar espacios con capacidad suficiente
  const suitable = spaces.filter(s => s.capacity >= requiredCapacity);
  
  if (suitable.length === 0) return null;
  
  // Ordenar por capacidad (menor primero) y retornar el más ajustado
  return suitable.sort((a, b) => a.capacity - b.capacity)[0];
}

// ==================== EXPORT DEFAULT ====================

/**
 * API de Conflictos, Prioridad y Catálogos - Objeto con todas las funciones
 * Permite importar como: import { catalogsApi } from '@/services/api'
 */
export const catalogsApi = {
  // Conflictos de prioridad
  getConflicts,
  makeDecision,
  resolveMultipleConflicts,
  
  // Catálogos de espacios
  getSpaces,
  getPublicSpaces,
  getSpaceById,
  getSpacesByCapacity,
  findBestSpace,
  
  // Catálogos de departamentos
  getDepartments,
  getDepartmentById,
  
  // Solicitudes públicas
  submitPublicRequest,
  trackPublicRequest
};

export default catalogsApi;
