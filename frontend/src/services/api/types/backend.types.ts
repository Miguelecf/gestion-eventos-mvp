/**
 * ===================================================================
 * TIPOS BACKEND - DTOs EXACTOS DEL BACKEND (Spring Boot)
 * ===================================================================
 * Estos tipos representan la estructura RAW que devuelve el backend.
 * NO modificar - deben coincidir con los DTOs de Java.
 * ===================================================================
 */

// ==================== ENUMS DEL BACKEND ====================
// Nota: Usamos const objects con 'as const' en lugar de enums
// por la configuración de TypeScript (erasableSyntaxOnly)

/**
 * Estado del Evento
 */
export const EventStatus = {
  SOLICITADO: 'SOLICITADO',
  EN_REVISION: 'EN_REVISION',
  RESERVADO: 'RESERVADO',
  APROBADO: 'APROBADO',
  RECHAZADO: 'RECHAZADO'
} as const;
export type EventStatus = typeof EventStatus[keyof typeof EventStatus];

/**
 * Prioridad del Evento
 */
export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
} as const;
export type Priority = typeof Priority[keyof typeof Priority];

/**
 * Modo de Soporte Técnico
 */
export const TechSupportMode = {
  SETUP_ONLY: 'SETUP_ONLY',
  FULL_SUPPORT: 'FULL_SUPPORT'
} as const;
export type TechSupportMode = typeof TechSupportMode[keyof typeof TechSupportMode];

/**
 * Tipo de Audiencia
 */
export const AudienceType = {
  ESTUDIANTES: 'ESTUDIANTES',
  COMUNIDAD: 'COMUNIDAD',
  MIXTO: 'MIXTO',
  DOCENTES: 'DOCENTES',
  AUTORIDADES: 'AUTORIDADES'
} as const;
export type AudienceType = typeof AudienceType[keyof typeof AudienceType];

/**
 * Roles de Usuario
 */
export const UserRole = {
  USUARIO: 'USUARIO',
  ADMIN_CEREMONIAL: 'ADMIN_CEREMONIAL',
  ADMIN_TECNICA: 'ADMIN_TECNICA',
  ADMIN_FULL: 'ADMIN_FULL'
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

/**
 * Visibilidad de Comentarios
 */
export const CommentVisibility = {
  INTERNAL: 'INTERNAL',
  PUBLIC: 'PUBLIC'
} as const;
export type CommentVisibility = typeof CommentVisibility[keyof typeof CommentVisibility];

/**
 * Tipos de Acciones de Auditoría
 */
export const AuditActionType = {
  STATUS_CHANGE: 'STATUS_CHANGE',
  FIELD_CHANGE: 'FIELD_CHANGE',
  COMMENT: 'COMMENT'
} as const;
export type AuditActionType = typeof AuditActionType[keyof typeof AuditActionType];

/**
 * Estado de Solicitudes Públicas
 */
export const PublicRequestStatus = {
  RECEIVED: 'RECEIVED',
  CONVERTED: 'CONVERTED'
} as const;
export type PublicRequestStatus = typeof PublicRequestStatus[keyof typeof PublicRequestStatus];

/**
 * Estado de Conflictos de Prioridad
 */
export const PriorityConflictStatus = {
  PENDING: 'PENDING',
  RESOLVED: 'RESOLVED'
} as const;
export type PriorityConflictStatus = typeof PriorityConflictStatus[keyof typeof PriorityConflictStatus];

/**
 * Decisión sobre Conflictos
 */
export const ConflictDecision = {
  KEEP_NEW: 'KEEP_NEW',
  KEEP_DISPLACED: 'KEEP_DISPLACED'
} as const;
export type ConflictDecision = typeof ConflictDecision[keyof typeof ConflictDecision];

// ==================== DTOs DEL BACKEND ====================

/**
 * DTO de Evento del Backend (respuesta anidada)
 * Endpoint: GET /api/events, GET /api/events/{id}
 */
export interface BackendEventDTO {
  id: number;
  date: string;               // yyyy-MM-dd
  technicalSchedule: string | null; // HH:mm
  scheduleFrom: string;       // HH:mm
  scheduleTo: string;         // HH:mm
  status: EventStatus;
  name: string;
  requestingArea: string | null;
  space: {
    id: number;
    name: string;
    capacity: number;
    colorHex: string;
  } | null;
  freeLocation: string | null;
  department: {
    id: number;
    name: string;
    colorHex: string;
  } | null;
  requirements: string | null;
  coverage: string | null;
  observations: string | null;
  priority: Priority;
  audienceType: AudienceType;
  internal: boolean;
  ceremonialOk: boolean;
  technicalOk: boolean;
  requiresTech: boolean;
  techSupportMode: TechSupportMode | null;
  requiresRebooking: boolean;
  bufferBeforeMin: number;
  bufferAfterMin: number;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string;          // ISO 8601
  updatedAt: string;          // ISO 8601
  createdBy: {
    id: number;
    username: string;
    name: string;
    lastName: string;
    email: string;
  } | null;
  lastModifiedBy: {
    id: number;
    username: string;
    name: string;
    lastName: string;
    email: string;
  } | null;
}

/**
 * DTO para crear Evento
 * Endpoint: POST /api/events
 */
export interface BackendCreateEventDTO {
  date: string;                      // yyyy-MM-dd
  technicalSchedule?: string | null; // HH:mm
  scheduleFrom: string;              // HH:mm
  scheduleTo: string;                // HH:mm
  spaceId: number | null;
  freeLocation: string | null;
  departmentId: number | null;
  name: string;
  requestingArea?: string | null;
  requirements?: string | null;
  coverage?: string | null;
  observations?: string | null;
  priority: Priority;
  audienceType: AudienceType;
  internal: boolean;
  requiresTech: boolean;
  techSupportMode?: TechSupportMode | null;
  bufferBeforeMin?: number;
  bufferAfterMin?: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

/**
 * DTO para actualizar Evento
 * Endpoint: PATCH /api/events/{id}
 */
export type BackendUpdateEventDTO = Partial<Omit<BackendCreateEventDTO, 'contactName' | 'contactEmail' | 'contactPhone'>> & {
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
};

/**
 * DTO de respuesta GET /api/events/{id}/status
 * IMPORTANTE: El backend devuelve 'current' y 'allowed' (no 'currentStatus' y 'allowedTransitions')
 */
export interface BackendEventStatusResponse {
  eventId: number;
  current: string;              // ✅ Campo real del backend
  allowed: string[];            // ✅ Campo real del backend
  currentStatus?: string;       // Deprecated: mantener por compatibilidad
  allowedTransitions?: string[]; // Deprecated: mantener por compatibilidad
}

/**
 * DTO de request POST /api/events/{id}/status
 */
export interface BackendChangeStatusRequest {
  to: string;
  reason?: string | null;
  note?: string | null;
}

/**
 * DTO de respuesta de cambio de estado
 * Endpoint: POST /api/events/{id}/status
 */
export interface BackendStatusChangeResponse {
  eventId: number;
  newStatus: EventStatus;
  approvalPending?: boolean;
  missingApprovals?: string[];
  missing?: string[]; // Variante alternativa del backend
}

/**
 * DTO de Comentario del Backend
 * Endpoint: GET /api/events/{eventId}/comments
 */
export interface BackendCommentDTO {
  id: number;
  body: string;
  visibility: CommentVisibility;
  authorId: number;
  authorUsername: string;
  authorName: string;
  authorLastName: string;
  createdAt: string;         // ISO 8601
  updatedAt: string;         // ISO 8601
}

/**
 * Respuesta paginada de comentarios
 * Endpoint: GET /api/events/{eventId}/comments
 */
export interface BackendCommentsPage {
  eventId: number;
  comments: BackendCommentDTO[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

/**
 * DTO para crear Comentario
 * Endpoint: POST /api/events/{eventId}/comments
 */
export interface BackendCreateCommentDTO {
  body: string;
}

/**
 * DTO para actualizar Comentario
 * Endpoint: PATCH /api/events/{eventId}/comments/{commentId}
 */
export interface BackendUpdateCommentDTO {
  body: string;
}

/**
 * DTO de entrada de Auditoría del Backend
 * Endpoint: GET /api/audit/{eventId}
 */
export interface BackendAuditEntryDTO {
  id: number;
  actionType: AuditActionType;
  fromValue: string | null;
  toValue: string | null;
  details: string | null;
  actorId: number;
  actorUsername: string;
  actorName: string;
  actorLastName: string;
  timestamp: string;         // ISO 8601
}

/**
 * Respuesta paginada de auditoría
 * Endpoint: GET /api/audit/{eventId}
 */
export interface BackendAuditPage {
  eventId: number;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  entries: BackendAuditEntryDTO[];
}

/**
 * DTO de Espacio del Backend
 * Endpoint: GET /api/catalogs/spaces
 */
export interface BackendSpaceDTO {
  id: number;
  name: string;
  capacity: number;
  location: string;
  description: string;
  colorHex: string;
  defaultBufferBeforeMin: number;
  defaultBufferAfterMin: number;
  active: boolean;
}

/**
 * DTO de Departamento del Backend
 * Endpoint: GET /api/catalogs/departments
 */
export interface BackendDepartmentDTO {
  id: number;
  name: string;
  colorHex: string;
  active: boolean;
}

/**
 * Respuesta de disponibilidad de espacio
 * Endpoint: POST /api/availability/check, POST /public/availability/check
 */
export interface BackendSpaceAvailabilityResponse {
  available: boolean;
  conflicts: Array<{
    eventId: number;
    eventName: string;
    from: string;              // HH:mm
    to: string;                // HH:mm
    status?: EventStatus;
    priority?: Priority;
    bufferBefore?: number;
    bufferAfter?: number;
  }>;
}

/**
 * Respuesta de capacidad técnica
 * Endpoint: GET /internal/tech/capacity
 */
export interface BackendTechnicalCapacityResponse {
  date: string;              // yyyy-MM-dd
  maxCapacity: number;
  blocks: Array<{
    time: string;            // HH:mm
    used: number;
    available: number;
  }>;
}

/**
 * Respuesta de conflictos de prioridad
 * Endpoint: GET /internal/priority/conflicts
 */
export interface BackendPriorityConflictsResponse {
  eventId: number;
  conflicts: Array<{
    conflictCode: string;
    displacedEventId: number;
    displacedEventName: string;
    displacedEventDate: string;      // yyyy-MM-dd
    displacedEventTime: string;      // "HH:mm - HH:mm"
    status: PriorityConflictStatus;
    createdAt: string;               // ISO 8601
  }>;
}

/**
 * DTO para registrar decisión de conflicto de prioridad
 * Endpoint: POST /internal/priority/decisions
 */
export interface BackendPriorityDecisionDTO {
  conflictCode: string;
  decision: 'KEEP_NEW' | 'KEEP_DISPLACED';
  target: 'DISPLACING_EVENT' | 'DISPLACED_EVENT';
}

/**
 * Respuesta de decisión de conflicto de prioridad
 * Endpoint: POST /internal/priority/decisions
 */
export interface BackendPriorityDecisionResult {
  conflictCode: string;
  decision: 'KEEP_NEW' | 'KEEP_DISPLACED';
  status: 'RESOLVED';
}

/**
 * DTO para enviar solicitud pública
 * Endpoint: POST /public/event-requests
 */
export interface BackendSubmitPublicRequestDTO {
  date: string;                      // yyyy-MM-dd
  technicalSchedule?: string | null; // HH:mm
  scheduleFrom: string;              // HH:mm
  scheduleTo: string;                // HH:mm
  name: string;
  spaceId: number | null;
  freeLocation: string | null;
  requestingDepartmentId: number | null;
  requirements?: string | null;
  coverage?: string | null;
  observations?: string | null;
  priority: Priority;
  audienceType: AudienceType;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  bufferBeforeMin?: number;
  bufferAfterMin?: number;
}

/**
 * Respuesta de envío de solicitud pública
 * Endpoint: POST /public/event-requests
 */
export interface BackendSubmitPublicRequestResponse {
  trackingUuid: string;
  status: PublicRequestStatus;
  submittedAt: string;           // ISO 8601
}

/**
 * Respuesta de tracking de solicitud pública
 * Endpoint: GET /public/track/{trackingUuid}
 */
export interface BackendPublicTrackingResponse {
  trackingUuid: string;
  requestStatus: PublicRequestStatus;
  submittedAt: string;           // ISO 8601
  eventId: number | null;
  eventStatus: EventStatus | null;
  eventDetails: {
    name: string;
    date: string;                // yyyy-MM-dd
    from: string;                // HH:mm
    to: string;                  // HH:mm
    spaceName: string | null;
    departmentName: string | null;
  } | null;
  statusHistory: Array<{
    status: PublicRequestStatus | EventStatus;
    timestamp: string;           // ISO 8601
    description: string;
  }>;
}

/**
 * DTO de usuario autenticado
 * Endpoint: GET /auth/me
 */
export interface BackendMeDTO {
  id: number;
  username: string;
  email: string;
  name: string;
  lastName: string;
  role: UserRole;
}

// ==================== RESPUESTAS PAGINADAS DE SPRING BOOT ====================

/**
 * Respuesta paginada genérica de Spring Boot
 */
export interface BackendPageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
}
