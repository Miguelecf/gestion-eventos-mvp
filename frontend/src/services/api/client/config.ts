/**
 * Configuración del cliente HTTP
 * Define URLs base, timeouts y headers por defecto
 */

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090',
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
} as const;

/**
 * ===================================================================
 * 🛠️ DEV: TOKEN HARDCODEADO PARA TESTING
 * ===================================================================
 * ⚠️ REMOVER ANTES DE PRODUCCIÓN
 * 
 * Instrucciones:
 * 1. Hacer login en backend (Postman/Thunder Client/cURL):
 *    POST http://localhost:9090/api/auth/login
 *    Body: { "username": "admin", "password": "tu_password" }
 * 
 * 2. Copiar el token de la respuesta (sin "Bearer", solo el token)
 * 
 * 3. Pegar aquí abajo reemplazando el valor actual
 * 
 * 4. Guardar archivo → El token se configura automáticamente
 * 
 * Para desactivar: dejar string vacío ''
 * ===================================================================
 */
export const DEV_AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJhZG1pbi5mdWxsIiwicm9sZSI6IkFETUlOX0ZVTEwiLCJzY29wZXMiOltdLCJpYXQiOjE3NjI5ODU4MjMsImV4cCI6MTc2Mjk4NjcyM30.wGmdhaRhRb18FdHeVZqY_xd4bsVDRz3f78TBYGgaipA';

/**
 * Verifica si el token de desarrollo está configurado
 */
export const hasDevToken = (): boolean => {
  return import.meta.env.DEV && DEV_AUTH_TOKEN.trim().length > 0;
};

/**
 * Endpoints de la API
 * Mapeo completo de todos los endpoints del backend según PDF
 */
export const ENDPOINTS = {
  // ================ AUTENTICACIÓN ================
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  REGISTER: '/auth/register',
  ME: '/auth/me',
  CHANGE_PASSWORD: '/auth/change-password',

  // ================ EVENTOS (/api/events) ================
  EVENTS: '/api/events',
  EVENT_BY_ID: (id: number) => `/api/events/${id}`,
  EVENT_STATUS: (id: number) => `/api/events/${id}/status`,
  EVENT_SOFT_DELETE: (id: number) => `/api/events/${id}/soft-delete`,
  // Filtros útiles
  EVENTS_BY_DATE: '/api/events/date', // ?date=yyyy-MM-dd
  EVENTS_BY_RANGE: '/api/events/range', // ?start=yyyy-MM-dd&end=yyyy-MM-dd
  EVENTS_BY_PRIORITY: (priority: string) => `/api/events/priority/${priority}`,
  EVENTS_BY_STATUS: (status: string) => `/api/events/status/${status}`,
  EVENTS_BY_USER: (userId: number) => `/api/events/user/${userId}`,

  // ================ COMENTARIOS ================
  COMMENTS: (eventId: number) => `/api/events/${eventId}/comments`,
  COMMENT_BY_ID: (eventId: number, commentId: number) =>
    `/api/events/${eventId}/comments/${commentId}`,

  // ================ AUDITORÍA ================
  AUDIT_BY_EVENT: (eventId: number) => `/api/audit/${eventId}`,

  // ================ DISPONIBILIDAD ================
  AVAILABILITY_CHECK: '/api/availability/check',            // POST
  AVAILABILITY_PUBLIC_CHECK: '/public/availability/check',  // POST
  PUBLIC_SPACE_OCCUPANCY: (spaceId: number) =>
    `/public/spaces/${spaceId}/occupancy`,                 // GET ?date=yyyy-MM-dd

  // ================ CONFLICTOS DE PRIORIDAD (internal) ================
  INTERNAL_PRIORITY_CONFLICTS: '/internal/priority/conflicts', // GET ?eventId=...
  INTERNAL_PRIORITY_DECISIONS: '/internal/priority/decisions', // POST

  // ================ CAPACIDAD TÉCNICA (internal) ================
  INTERNAL_TECH_CAPACITY: '/internal/tech/capacity', // GET ?date=yyyy-MM-dd
  INTERNAL_TECH_EVENTS: '/internal/tech/events',     // GET ?date=yyyy-MM-dd

  // ================ CATÁLOGOS ================
  CATALOG_SPACES: '/api/catalogs/spaces',
  CATALOG_SPACES_PUBLIC: '/api/catalogs/spaces/public',
  CATALOG_SPACE_BY_ID: (id: number) => `/api/catalogs/spaces/${id}`,
  CATALOG_DEPARTMENTS: '/api/catalogs/departments',
  CATALOG_DEPARTMENT_BY_ID: (id: number) => `/api/catalogs/departments/${id}`,

  // ================ SOLICITUDES PÚBLICAS ================
  PUBLIC_EVENT_REQUESTS: '/public/event-requests', // POST
  PUBLIC_TRACK: (trackingUuid: string) => `/public/track/${trackingUuid}`,
} as const;

/**
 * Códigos de error personalizados del backend
 */
export const ERROR_CODES = {
  // Errores de red
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // Errores HTTP generales
  BAD_REQUEST: 'HTTP_400',
  UNAUTHORIZED: 'HTTP_401',
  FORBIDDEN: 'HTTP_403',
  NOT_FOUND: 'HTTP_404',
  CONFLICT: 'HTTP_409',
  INTERNAL_SERVER_ERROR: 'HTTP_500',
  
  // Errores de negocio (del backend)
  SPACE_NOT_AVAILABLE: 'SPACE_NOT_AVAILABLE',
  TECHNICAL_CAPACITY_EXCEEDED: 'TECHNICAL_CAPACITY_EXCEEDED',
  PRIORITY_CONFLICT: 'PRIORITY_CONFLICT',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  INVALID_TIME_RANGE: 'INVALID_TIME_RANGE',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  COMMENT_NOT_FOUND: 'COMMENT_NOT_FOUND',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  DUPLICATE_EVENT: 'DUPLICATE_EVENT',
  INVALID_EQUIPMENT: 'INVALID_EQUIPMENT',
  BUFFER_CONFLICT: 'BUFFER_CONFLICT',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
