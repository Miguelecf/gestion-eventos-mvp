import type { Space, Department } from "./event";

/**
 * Estados de una solicitud de evento público
 */
export type PublicRequestStatus = 
  | "RECIBIDO" 
  | "EN_REVISION" 
  | "CONVERTIDO" 
  | "RECHAZADA";

/**
 * Modo de soporte técnico requerido
 */
export type TechSupportMode = "SETUP_ONLY" | "FULL_SUPPORT";

/**
 * Tipo de audiencia del evento
 */
export type AudienceType = 
  | "ESTUDIANTES" 
  | "COMUNIDAD" 
  | "AUTORIDADES" 
  | "DOCENTES" 
  | "TERCERA_EDAD";

/**
 * Solicitud de evento público (frontend model)
 */
export interface PublicEventRequest {
  id: number;
  trackingUuid: string;
  status: PublicRequestStatus;
  
  // Información del evento
  name: string;
  audienceType: AudienceType;
  date: string; // yyyy-MM-dd
  scheduleFrom: string; // HH:mm
  scheduleTo: string; // HH:mm
  technicalSchedule: string | null; // HH:mm
  
  // Ubicación (una de las dos)
  space: Space | null;
  freeLocation: string | null;
  
  // Departamento solicitante
  requestingDepartment: Department | null;
  
  // Información de contacto
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  
  // Buffers de tiempo
  bufferBeforeMin: number;
  bufferAfterMin: number;
  
  // Soporte técnico
  requiresTech: boolean;
  techSupportMode: TechSupportMode | null;
  
  // Observaciones
  requirements: string | null;
  coverage: string | null;
  observations: string | null;
  
  // Metadata
  requestDate: string; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Filtros para el listado de solicitudes
 */
export interface PublicRequestFilters {
  search?: string;
  status?: PublicRequestStatus[];
  dateFrom?: string; // yyyy-MM-dd
  dateTo?: string; // yyyy-MM-dd
  requiresTech?: boolean;
  audienceType?: AudienceType[];
  spaceIds?: number[];
  departmentIds?: number[];
}

/**
 * Parámetros de query para el API
 */
export interface PublicRequestsQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  requiresTech?: boolean;
}

/**
 * Estado de paginación
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

/**
 * Helpers para badges de estado
 */
export function getRequestStatusBadgeVariant(
  status: PublicRequestStatus
): "default" | "success" | "outline" {
  switch (status) {
    case "RECIBIDO":
      return "default";
    case "EN_REVISION":
      return "outline";
    case "CONVERTIDO":
      return "success";
    case "RECHAZADA":
      return "outline";
    default:
      return "default";
  }
}

export function getRequestStatusLabel(status: PublicRequestStatus): string {
  switch (status) {
    case "RECIBIDO":
      return "Nueva";
    case "EN_REVISION":
      return "En Revisión";
    case "CONVERTIDO":
      return "Convertida";
    case "RECHAZADA":
      return "Rechazada";
    default:
      return status;
  }
}

export function getRequestStatusColor(status: PublicRequestStatus): string {
  switch (status) {
    case "RECIBIDO":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "EN_REVISION":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "CONVERTIDO":
      return "bg-gray-100 text-gray-700 border-gray-300";
    case "RECHAZADA":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
}

export function getRequestStatusDescription(
  status: PublicRequestStatus
): string {
  switch (status) {
    case "RECIBIDO":
      return "Solicitud recién recibida, pendiente de revisión";
    case "EN_REVISION":
      return "Solicitud en proceso de evaluación";
    case "CONVERTIDO":
      return "Ya se creó un evento desde esta solicitud";
    case "RECHAZADA":
      return "Solicitud rechazada por el equipo";
    default:
      return "";
  }
}

/**
 * Helpers para badges de soporte técnico
 */
export function getTechSupportLabel(
  requiresTech: boolean,
  mode: TechSupportMode | null
): string {
  if (!requiresTech) {
    return "Sin técnica";
  }
  
  if (mode === "SETUP_ONLY") {
    return "Montaje";
  }
  
  if (mode === "FULL_SUPPORT") {
    return "Acompañamiento";
  }
  
  return "Técnica requerida";
}

export function getTechSupportColor(
  requiresTech: boolean,
  mode: TechSupportMode | null
): string {
  if (!requiresTech) {
    return "bg-gray-100 text-gray-600 border-gray-300";
  }
  
  if (mode === "SETUP_ONLY") {
    return "bg-yellow-100 text-yellow-700 border-yellow-300";
  }
  
  if (mode === "FULL_SUPPORT") {
    return "bg-orange-100 text-orange-700 border-orange-300";
  }
  
  return "bg-blue-100 text-blue-700 border-blue-300";
}

/**
 * Helper para tipo de audiencia
 */
export function getAudienceTypeLabel(type: AudienceType): string {
  switch (type) {
    case "ESTUDIANTES":
      return "Estudiantes";
    case "COMUNIDAD":
      return "Comunidad";
    case "TERCERA_EDAD":
      return "Tercera Edad";
    case "DOCENTES":
      return "Docentes";
    case "AUTORIDADES":
      return "Autoridades";
    default:
      return type;
  }
}
