/**
 * ===================================================================
 * ADAPTADOR DE EVENTOS
 * ===================================================================
 * Transforma BackendEventDTO ↔ Event (modelo del frontend)
 * Maneja conversiones de fechas, prioridades y estructura de datos
 * ===================================================================
 */

import type { Event, EventStatus, EventPriority } from '@/models/event';
import type { 
  BackendEventDTO, 
  BackendCreateEventDTO, 
  BackendUpdateEventDTO,
  Priority 
} from '../types/backend.types';

// ==================== MAPEO DE ENUMS ====================

/**
 * Mapeo de prioridades: Backend → Frontend
 * Backend: LOW, MEDIUM, HIGH
 * Frontend: BAJA, MEDIA, ALTA, CRITICA
 */
const PRIORITY_BACKEND_TO_FRONTEND: Record<Priority, EventPriority> = {
  LOW: 'BAJA',
  MEDIUM: 'MEDIA',
  HIGH: 'ALTA'
} as const;

/**
 * Mapeo de prioridades: Frontend → Backend
 */
const PRIORITY_FRONTEND_TO_BACKEND: Record<EventPriority, Priority> = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

// ==================== ADAPTADORES PRINCIPALES ====================

/**
 * Adapta BackendEventDTO (del backend) a Event (modelo frontend)
 * 
 * @param backendEvent - DTO recibido del backend
 * @returns Event - Modelo normalizado del frontend
 * 
 * @example
 * const backendEvent = await fetch('/api/events/123');
 * const event = adaptEventFromBackend(backendEvent);
 * // event.priority === 'ALTA'
 * // event.date === Date object
 */
export function adaptEventFromBackend(backendEvent: BackendEventDTO): Event {
  return {
    // IDs básicos
    id: backendEvent.id,
    name: backendEvent.name,
    description: backendEvent.observations || undefined,

    // Fechas (conversión de strings a objetos Date/string ISO)
    date: backendEvent.date, // yyyy-MM-dd (mantener como string)
    scheduleFrom: backendEvent.scheduleFrom, // HH:mm (mantener como string)
    scheduleTo: backendEvent.scheduleTo, // HH:mm (mantener como string)
    createdOn: backendEvent.createdAt, // ISO 8601 timestamp

    // Relaciones (IDs extraídos de objetos anidados)
    spaceId: backendEvent.space?.id,
    departmentId: backendEvent.department?.id,
    createdBy: backendEvent.createdBy?.id.toString() || 'unknown',

    // Estados (mapeo directo - mismo enum)
    status: backendEvent.status as EventStatus,
    priority: PRIORITY_BACKEND_TO_FRONTEND[backendEvent.priority],

    // Flags booleanos
    requiresTech: backendEvent.requiresTech,
    internal: backendEvent.internal,
    technicalOk: backendEvent.technicalOk || null,
    ceremonialOk: backendEvent.ceremonialOk || null,

    // Metadata (objetos anidados)
    space: backendEvent.space ? {
      id: backendEvent.space.id,
      name: backendEvent.space.name
    } : undefined,
    department: backendEvent.department ? {
      id: backendEvent.department.id,
      name: backendEvent.department.name
    } : undefined
  };
}

/**
 * Adapta múltiples eventos del backend
 * 
 * @param backendEvents - Array de DTOs del backend
 * @returns Array de modelos Event del frontend
 * 
 * @example
 * const page = await fetch('/api/events?page=0');
 * const events = adaptEventsFromBackend(page.content);
 */
export function adaptEventsFromBackend(backendEvents: BackendEventDTO[]): Event[] {
  return backendEvents.map(adaptEventFromBackend);
}

/**
 * Adapta datos del frontend para crear evento en backend
 * Transforma Event parcial → BackendCreateEventDTO
 * 
 * @param eventData - Datos del formulario de creación
 * @returns DTO listo para enviar al backend (POST /api/events)
 * 
 * @example
 * const formData = {
 *   name: 'Conferencia',
 *   date: '2025-12-01',
 *   scheduleFrom: '09:00',
 *   scheduleTo: '11:00',
 *   priority: 'ALTA',
 *   // ...
 * };
 * const dto = adaptEventForCreate(formData);
 * await httpClient.post('/api/events', dto);
 */
export function adaptEventForCreate(
  eventData: Partial<Event> & {
    name: string;
    date: string;
    scheduleFrom: string;
    scheduleTo: string;
    priority: EventPriority;
    audienceType: 'ESTUDIANTES' | 'COMUNIDAD' | 'MIXTO';
    internal: boolean;
    requiresTech: boolean;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
  }
): BackendCreateEventDTO {
  return {
    // Fechas y horarios (ya vienen en formato correcto: yyyy-MM-dd y HH:mm)
    date: eventData.date, // yyyy-MM-dd
    technicalSchedule: eventData.requiresTech && eventData.scheduleFrom 
      ? eventData.scheduleFrom // HH:mm
      : null,
    scheduleFrom: eventData.scheduleFrom, // HH:mm
    scheduleTo: eventData.scheduleTo, // HH:mm

    // Relaciones (IDs)
    spaceId: eventData.spaceId ?? null,
    freeLocation: null, // TODO: implementar en formulario
    departmentId: eventData.departmentId ?? null,

    // Datos básicos
    name: eventData.name,
    requestingArea: null, // TODO: implementar en formulario
    requirements: eventData.description || null,
    coverage: null, // TODO: implementar en formulario
    observations: eventData.description || null,

    // Enums
    priority: PRIORITY_FRONTEND_TO_BACKEND[eventData.priority],
    audienceType: eventData.audienceType,
    internal: eventData.internal,

    // Flags técnicos
    requiresTech: eventData.requiresTech,
    techSupportMode: eventData.requiresTech ? 'SETUP_ONLY' : null,

    // Buffers (valores por defecto si no se especifican)
    bufferBeforeMin: 15, // TODO: hacer configurable
    bufferAfterMin: 15, // TODO: hacer configurable

    // Contacto (requerido por backend)
    contactName: eventData.contactName,
    contactEmail: eventData.contactEmail,
    contactPhone: eventData.contactPhone
  };
}

/**
 * Adapta datos del frontend para actualizar evento en backend
 * Transforma Event parcial → BackendUpdateEventDTO
 * 
 * @param eventData - Datos del formulario de edición (solo campos modificados)
 * @returns DTO listo para enviar al backend (PATCH /api/events/:id)
 * 
 * @example
 * const updates = {
 *   name: 'Nuevo nombre',
 *   priority: 'ALTA'
 * };
 * const dto = adaptEventForUpdate(updates);
 * await httpClient.patch(`/api/events/${id}`, dto);
 */
export function adaptEventForUpdate(
  eventData: Partial<Event> & {
    audienceType?: 'ESTUDIANTES' | 'COMUNIDAD' | 'MIXTO';
  }
): BackendUpdateEventDTO {
  const updateDTO: BackendUpdateEventDTO = {};

  // Solo incluir campos definidos (no undefined)
  if (eventData.date !== undefined) {
    updateDTO.date = eventData.date; // yyyy-MM-dd
  }
  
  if (eventData.scheduleFrom !== undefined) {
    updateDTO.scheduleFrom = eventData.scheduleFrom; // HH:mm
  }
  
  if (eventData.scheduleTo !== undefined) {
    updateDTO.scheduleTo = eventData.scheduleTo; // HH:mm
  }

  if (eventData.spaceId !== undefined) {
    updateDTO.spaceId = eventData.spaceId;
  }

  if (eventData.departmentId !== undefined) {
    updateDTO.departmentId = eventData.departmentId;
  }

  if (eventData.name !== undefined) {
    updateDTO.name = eventData.name;
  }

  if (eventData.description !== undefined) {
    updateDTO.requirements = eventData.description;
    updateDTO.observations = eventData.description;
  }

  if (eventData.priority !== undefined) {
    updateDTO.priority = PRIORITY_FRONTEND_TO_BACKEND[eventData.priority];
  }

  if (eventData.audienceType !== undefined) {
    updateDTO.audienceType = eventData.audienceType;
  }

  if (eventData.internal !== undefined) {
    updateDTO.internal = eventData.internal;
  }

  if (eventData.requiresTech !== undefined) {
    updateDTO.requiresTech = eventData.requiresTech;
    updateDTO.techSupportMode = eventData.requiresTech ? 'SETUP_ONLY' : null;
  }

  return updateDTO;
}

// ==================== HELPERS DE VALIDACIÓN ====================

/**
 * Valida si un evento es editable según su estado
 * 
 * @param event - Evento a validar
 * @returns true si el evento puede ser editado
 * 
 * @example
 * if (canEditEvent(event)) {
 *   // mostrar botón de edición
 * }
 */
export function canEditEvent(event: Event): boolean {
  // Solo SOLICITADO y EN_REVISION son editables
  return event.status === 'SOLICITADO' || event.status === 'EN_REVISION';
}

/**
 * Valida si un evento puede cambiar de estado
 * 
 * @param event - Evento a validar
 * @param targetStatus - Estado destino
 * @returns true si el cambio es válido
 * 
 * @example
 * if (canChangeEventStatus(event, 'APROBADO')) {
 *   // mostrar botón de aprobar
 * }
 */
export function canChangeEventStatus(event: Event, targetStatus: EventStatus): boolean {
  const currentStatus = event.status;

  // Definir transiciones válidas
  const validTransitions: Record<EventStatus, EventStatus[]> = {
    SOLICITADO: ['EN_REVISION', 'RECHAZADO'],
    EN_REVISION: ['RESERVADO', 'RECHAZADO'],
    RESERVADO: ['APROBADO', 'RECHAZADO'],
    APROBADO: [], // Estado final (no se puede cambiar)
    RECHAZADO: [] // Estado final (no se puede cambiar)
  };

  return validTransitions[currentStatus]?.includes(targetStatus) ?? false;
}

/**
 * Obtiene el color CSS asociado a un estado de evento
 * 
 * @param status - Estado del evento
 * @returns Clase CSS de color
 * 
 * @example
 * <Badge className={getEventStatusColor(event.status)}>
 *   {event.status}
 * </Badge>
 */
export function getEventStatusColor(status: EventStatus): string {
  const colorMap: Record<EventStatus, string> = {
    SOLICITADO: 'bg-blue-100 text-blue-800',
    EN_REVISION: 'bg-yellow-100 text-yellow-800',
    RESERVADO: 'bg-purple-100 text-purple-800',
    APROBADO: 'bg-green-100 text-green-800',
    RECHAZADO: 'bg-red-100 text-red-800'
  };

  return colorMap[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Obtiene el color CSS asociado a una prioridad
 * 
 * @param priority - Prioridad del evento
 * @returns Clase CSS de color
 * 
 * @example
 * <Badge className={getEventPriorityColor(event.priority)}>
 *   {event.priority}
 * </Badge>
 */
export function getEventPriorityColor(priority: EventPriority): string {
  const colorMap: Record<EventPriority, string> = {
    BAJA: 'bg-gray-100 text-gray-800',
    MEDIA: 'bg-blue-100 text-blue-800',
    ALTA: 'bg-orange-100 text-orange-800',
    CRITICA: 'bg-red-100 text-red-800'
  };

  return colorMap[priority] || 'bg-gray-100 text-gray-800';
}
