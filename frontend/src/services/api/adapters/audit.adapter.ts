/**
 * ===================================================================
 * ADAPTADOR DE AUDITORÍA
 * ===================================================================
 * Transforma BackendAuditEntryDTO ↔ AuditEntry (modelo del frontend)
 * Maneja conversiones de fechas y estructura de datos de auditoría
 * ===================================================================
 */

import type { 
  BackendAuditEntryDTO, 
  BackendAuditPage,
  AuditActionType 
} from '../types/backend.types';
import type { PageResponse } from '../types/pagination.types';

// ==================== TIPOS DEL FRONTEND ====================

/**
 * Modelo de entrada de auditoría para el frontend
 */
export interface AuditEntry {
  id: number;
  actionType: AuditActionType;
  fromValue: string | null;
  toValue: string | null;
  details: string | null;
  actor: {
    id: number;
    username: string;
    fullName: string; // name + lastName combinados
  };
  timestamp: Date; // Convertido a Date para facilitar operaciones
  // Campos calculados para la UI
  description: string; // Descripción legible del cambio
  icon: string; // Icono representativo de la acción
  color: string; // Color CSS para el badge
}

// ==================== ADAPTADORES PRINCIPALES ====================

/**
 * Adapta BackendAuditEntryDTO (del backend) a AuditEntry (modelo frontend)
 * 
 * @param backendEntry - DTO recibido del backend
 * @returns AuditEntry - Modelo normalizado del frontend con campos calculados
 * 
 * @example
 * const backendEntry = await fetch('/api/audit/123');
 * const entry = adaptAuditEntryFromBackend(backendEntry);
 * // entry.description === 'cambió el estado de SOLICITADO a APROBADO'
 * // entry.actor.fullName === 'Juan Pérez'
 */
export function adaptAuditEntryFromBackend(backendEntry: BackendAuditEntryDTO): AuditEntry {
  const timestamp = new Date(backendEntry.timestamp);

  return {
    id: backendEntry.id,
    actionType: backendEntry.actionType,
    fromValue: backendEntry.fromValue,
    toValue: backendEntry.toValue,
    details: backendEntry.details,
    
    // Actor: combinar datos individuales en objeto estructurado
    actor: {
      id: backendEntry.actorId,
      username: backendEntry.actorUsername,
      fullName: `${backendEntry.actorName} ${backendEntry.actorLastName}`.trim()
    },

    // Fecha: convertir ISO 8601 string a Date object
    timestamp,

    // Campos calculados para UI
    description: generateAuditDescription(backendEntry),
    icon: getAuditIcon(backendEntry.actionType),
    color: getAuditColor(backendEntry.actionType)
  };
}

/**
 * Adapta múltiples entradas de auditoría del backend
 * 
 * @param backendEntries - Array de DTOs del backend
 * @returns Array de modelos AuditEntry del frontend
 * 
 * @example
 * const page = await fetch('/api/audit/123');
 * const entries = adaptAuditEntriesFromBackend(page.entries);
 */
export function adaptAuditEntriesFromBackend(
  backendEntries: BackendAuditEntryDTO[]
): AuditEntry[] {
  return backendEntries.map(adaptAuditEntryFromBackend);
}

/**
 * Adapta página de auditoría del backend a formato normalizado
 * 
 * @param backendPage - Respuesta de paginación del backend
 * @returns PageResponse con entradas de auditoría adaptadas
 * 
 * @example
 * const backendPage = await fetch('/api/audit/123?page=0');
 * const page = adaptAuditPageFromBackend(backendPage);
 * // page.content = AuditEntry[]
 * // page.page.number = 0
 */
export function adaptAuditPageFromBackend(
  backendPage: BackendAuditPage
): PageResponse<AuditEntry> {
  return {
    content: adaptAuditEntriesFromBackend(backendPage.entries),
    page: {
      number: backendPage.currentPage,
      size: backendPage.pageSize,
      totalElements: backendPage.totalElements,
      totalPages: backendPage.totalPages
    },
    first: backendPage.currentPage === 0,
    last: backendPage.currentPage === backendPage.totalPages - 1,
    empty: backendPage.entries.length === 0
  };
}

// ==================== HELPERS DE DESCRIPCIÓN ====================

/**
 * Genera descripción legible en español de un cambio de auditoría
 * 
 * @param entry - Entrada de auditoría del backend
 * @returns Descripción en español del cambio
 * 
 * @example
 * generateAuditDescription({
 *   actionType: 'STATUS_CHANGE',
 *   fromValue: 'SOLICITADO',
 *   toValue: 'APROBADO',
 *   details: null
 * });
 * // => "cambió el estado de SOLICITADO a APROBADO"
 */
function generateAuditDescription(entry: BackendAuditEntryDTO): string {
  switch (entry.actionType) {
    case 'STATUS_CHANGE':
      return `cambió el estado de ${entry.fromValue || 'N/A'} a ${entry.toValue || 'N/A'}`;
    
    case 'FIELD_CHANGE':
      if (entry.details) {
        return `modificó ${entry.details}`;
      }
      return `actualizó un campo de ${entry.fromValue || 'vacío'} a ${entry.toValue || 'vacío'}`;
    
    case 'COMMENT':
      return `agregó un comentario${entry.details ? `: "${entry.details}"` : ''}`;
    
    default:
      return 'realizó una acción';
  }
}

/**
 * Obtiene el icono representativo de una acción de auditoría
 * 
 * @param actionType - Tipo de acción
 * @returns Nombre del icono (para librerías como lucide-react)
 * 
 * @example
 * const icon = getAuditIcon('STATUS_CHANGE');
 * // => 'arrow-right-circle'
 * <ArrowRightCircle className="h-4 w-4" />
 */
function getAuditIcon(actionType: AuditActionType): string {
  const iconMap: Record<AuditActionType, string> = {
    STATUS_CHANGE: 'arrow-right-circle',
    FIELD_CHANGE: 'edit',
    COMMENT: 'message-square'
  };

  return iconMap[actionType] || 'circle';
}

/**
 * Obtiene el color CSS asociado a una acción de auditoría
 * 
 * @param actionType - Tipo de acción
 * @returns Clase CSS de color
 * 
 * @example
 * const color = getAuditColor('STATUS_CHANGE');
 * // => 'bg-blue-100 text-blue-800'
 * <Badge className={color}>Cambio de estado</Badge>
 */
function getAuditColor(actionType: AuditActionType): string {
  const colorMap: Record<AuditActionType, string> = {
    STATUS_CHANGE: 'bg-blue-100 text-blue-800',
    FIELD_CHANGE: 'bg-yellow-100 text-yellow-800',
    COMMENT: 'bg-green-100 text-green-800'
  };

  return colorMap[actionType] || 'bg-gray-100 text-gray-800';
}

// ==================== HELPERS DE AGRUPACIÓN ====================

/**
 * Agrupa entradas de auditoría por fecha (día)
 * 
 * @param entries - Array de entradas de auditoría
 * @returns Map con entradas agrupadas por fecha (yyyy-MM-dd)
 * 
 * @example
 * const grouped = groupAuditEntriesByDate(entries);
 * grouped.forEach((entries, date) => {
 *   console.log(`${date}: ${entries.length} cambios`);
 * });
 */
export function groupAuditEntriesByDate(
  entries: AuditEntry[]
): Map<string, AuditEntry[]> {
  const grouped = new Map<string, AuditEntry[]>();

  entries.forEach(entry => {
    const dateKey = entry.timestamp.toISOString().split('T')[0]; // yyyy-MM-dd
    const existing = grouped.get(dateKey) || [];
    grouped.set(dateKey, [...existing, entry]);
  });

  return grouped;
}

/**
 * Agrupa entradas de auditoría por tipo de acción
 * 
 * @param entries - Array de entradas de auditoría
 * @returns Map con entradas agrupadas por tipo de acción
 * 
 * @example
 * const grouped = groupAuditEntriesByAction(entries);
 * const statusChanges = grouped.get('STATUS_CHANGE') || [];
 */
export function groupAuditEntriesByAction(
  entries: AuditEntry[]
): Map<AuditActionType, AuditEntry[]> {
  const grouped = new Map<AuditActionType, AuditEntry[]>();

  entries.forEach(entry => {
    const existing = grouped.get(entry.actionType) || [];
    grouped.set(entry.actionType, [...existing, entry]);
  });

  return grouped;
}

/**
 * Agrupa entradas de auditoría por actor
 * 
 * @param entries - Array de entradas de auditoría
 * @returns Map con entradas agrupadas por ID de actor
 * 
 * @example
 * const grouped = groupAuditEntriesByActor(entries);
 * const userChanges = grouped.get(userId) || [];
 */
export function groupAuditEntriesByActor(
  entries: AuditEntry[]
): Map<number, AuditEntry[]> {
  const grouped = new Map<number, AuditEntry[]>();

  entries.forEach(entry => {
    const existing = grouped.get(entry.actor.id) || [];
    grouped.set(entry.actor.id, [...existing, entry]);
  });

  return grouped;
}

// ==================== HELPERS DE FILTRADO ====================

/**
 * Filtra entradas de auditoría por tipo de acción
 * 
 * @param entries - Array de entradas de auditoría
 * @param actionTypes - Tipos de acción a incluir
 * @returns Array filtrado de entradas
 * 
 * @example
 * const statusChanges = filterAuditEntriesByAction(
 *   entries,
 *   ['STATUS_CHANGE']
 * );
 */
export function filterAuditEntriesByAction(
  entries: AuditEntry[],
  actionTypes: AuditActionType[]
): AuditEntry[] {
  return entries.filter(entry => actionTypes.includes(entry.actionType));
}

/**
 * Filtra entradas de auditoría por rango de fechas
 * 
 * @param entries - Array de entradas de auditoría
 * @param startDate - Fecha inicial (inclusive)
 * @param endDate - Fecha final (inclusive)
 * @returns Array filtrado de entradas
 * 
 * @example
 * const lastWeek = filterAuditEntriesByDateRange(
 *   entries,
 *   new Date('2025-01-01'),
 *   new Date('2025-01-07')
 * );
 */
export function filterAuditEntriesByDateRange(
  entries: AuditEntry[],
  startDate: Date,
  endDate: Date
): AuditEntry[] {
  return entries.filter(entry => {
    return entry.timestamp >= startDate && entry.timestamp <= endDate;
  });
}

/**
 * Filtra entradas de auditoría por actor
 * 
 * @param entries - Array de entradas de auditoría
 * @param actorId - ID del actor
 * @returns Array filtrado de entradas
 * 
 * @example
 * const myChanges = filterAuditEntriesByActor(entries, currentUser.id);
 */
export function filterAuditEntriesByActor(
  entries: AuditEntry[],
  actorId: number
): AuditEntry[] {
  return entries.filter(entry => entry.actor.id === actorId);
}

// ==================== HELPERS DE FORMATO ====================

/**
 * Obtiene el tiempo relativo desde una acción de auditoría
 * 
 * @param entry - Entrada de auditoría
 * @returns String con tiempo relativo (ej: "hace 2 horas")
 * 
 * @example
 * <span>{getAuditEntryAge(entry)}</span>
 * // "hace 2 horas"
 */
export function getAuditEntryAge(entry: AuditEntry): string {
  const now = new Date();
  const diffMs = now.getTime() - entry.timestamp.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  
  // Más de 7 días: mostrar fecha
  return entry.timestamp.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formatea la fecha de una entrada de auditoría
 * 
 * @param entry - Entrada de auditoría
 * @returns String con fecha formateada
 * 
 * @example
 * formatAuditEntryDate(entry);
 * // => "01 ene 2025, 14:30"
 */
export function formatAuditEntryDate(entry: AuditEntry): string {
  return entry.timestamp.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Obtiene un resumen de cambios de auditoría
 * 
 * @param entries - Array de entradas de auditoría
 * @returns Objeto con estadísticas de cambios
 * 
 * @example
 * const summary = getAuditSummary(entries);
 * // {
 * //   total: 10,
 * //   byAction: { STATUS_CHANGE: 3, FIELD_CHANGE: 5, COMMENT: 2 },
 * //   uniqueActors: 2,
 * //   dateRange: { start: Date, end: Date }
 * // }
 */
export function getAuditSummary(entries: AuditEntry[]): {
  total: number;
  byAction: Record<AuditActionType, number>;
  uniqueActors: number;
  dateRange: { start: Date | null; end: Date | null };
} {
  if (entries.length === 0) {
    return {
      total: 0,
      byAction: { STATUS_CHANGE: 0, FIELD_CHANGE: 0, COMMENT: 0 },
      uniqueActors: 0,
      dateRange: { start: null, end: null }
    };
  }

  const byAction: Record<AuditActionType, number> = {
    STATUS_CHANGE: 0,
    FIELD_CHANGE: 0,
    COMMENT: 0
  };

  const actorIds = new Set<number>();
  const timestamps = entries.map(e => e.timestamp);

  entries.forEach(entry => {
    byAction[entry.actionType]++;
    actorIds.add(entry.actor.id);
  });

  return {
    total: entries.length,
    byAction,
    uniqueActors: actorIds.size,
    dateRange: {
      start: new Date(Math.min(...timestamps.map(d => d.getTime()))),
      end: new Date(Math.max(...timestamps.map(d => d.getTime())))
    }
  };
}

/**
 * Obtiene etiqueta en español para tipo de acción
 * 
 * @param actionType - Tipo de acción
 * @returns Etiqueta en español
 * 
 * @example
 * getActionTypeLabel('STATUS_CHANGE');
 * // => 'Cambio de estado'
 */
export function getActionTypeLabel(actionType: AuditActionType): string {
  const labelMap: Record<AuditActionType, string> = {
    STATUS_CHANGE: 'Cambio de estado',
    FIELD_CHANGE: 'Modificación de campo',
    COMMENT: 'Comentario'
  };

  return labelMap[actionType] || actionType;
}
