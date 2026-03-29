/**
 * ===================================================================
 * MODELOS DEL FRONTEND - TIPOS DE DOMINIO
 * ===================================================================
 * Estos tipos representan la estructura de datos utilizada en el frontend.
 * Se adaptan desde los DTOs del backend para facilitar su uso en la UI.
 * ===================================================================
 */

import type {
  EventStatus,
  Priority,
  TechSupportMode,
  AudienceType,
  EventOriginType,
} from '@/services/api/types/backend.types';
import type { Space } from './space';
import type { Department } from './department';

/**
 * Usuario básico (creador/modificador)
 */
export interface User {
  id: number;
  username: string;
  name: string;
  lastName: string;
  email: string;
}

/**
 * Evento - Modelo principal del frontend
 * Coincide con BackendEventDTO del backend
 */
export interface Event {
  id: number;
  date: string;               // yyyy-MM-dd
  technicalSchedule: string | null; // HH:mm
  scheduleFrom: string;       // HH:mm
  scheduleTo: string;         // HH:mm
  status: EventStatus;
  name: string;
  requestingArea: string | null;
  space: Space | null;
  freeLocation: string | null;
  department: Department | null;
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
  createdBy: User | null;
  lastModifiedBy: User | null;
  originType?: EventOriginType | null;
  originRequestId?: number | null;
  
  // Propiedades adicionales del frontend
  spaceId?: number;
  departmentId?: number;
  description?: string; // Alias de observations
  createdOn?: string; // Alias de createdAt
}

/**
 * Tipos de prioridad (para compatibilidad con código existente)
 */
export type EventPriority = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

// Re-exportar tipos del backend
export type { EventStatus, Priority, TechSupportMode, AudienceType, EventOriginType };

/**
 * Filtros para búsqueda de eventos
 */
export interface EventFilters {
  search?: string;
  status?: EventStatus[];
  priority?: Priority[];
  departmentIds?: number[];
  spaceIds?: number[];
  dateFrom?: string;          // yyyy-MM-dd
  dateTo?: string;            // yyyy-MM-dd
  startDate?: string;         // Alias de dateFrom
  endDate?: string;           // Alias de dateTo
  requiresTech?: boolean;
  internal?: boolean;
  audienceType?: AudienceType[];
  createdBy?: string;
}

/**
 * Estadísticas de eventos
 */
export interface EventStats {
  total: number;
  byStatus: Record<EventStatus, number>;
  byPriority: Record<Priority, number>;
  byMonth: Array<{ month: string; count: number }>;
}

/**
 * ConfiguraciÃ³n de ordenamiento para listados
 */
export interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Estado de paginaciÃ³n para listados de eventos
 */
export interface PaginationState {
  page: number;
  pageSize: 10 | 20 | 50 | 100;
  total: number;
  totalPages: number;
}

/**
 * Disponibilidad de espacio
 */
export interface SpaceAvailability {
  spaceId: number;
  available: boolean;
  conflicts?: Event[];
}
