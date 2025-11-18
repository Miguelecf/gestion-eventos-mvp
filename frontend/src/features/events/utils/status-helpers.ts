/**
 * ===================================================================
 * UTILIDADES DE ESTADOS DE EVENTOS
 * ===================================================================
 * Helpers para UI relacionados con estados de eventos
 * - Obtener variantes de badges
 * - Labels y descripciones en español
 * - Iconos y colores por estado
 * - Validaciones de negocio (isFinalStatus, canEditEvent)
 * - Mensajes de confirmación
 * ===================================================================
 */

import type { EventStatus } from '@/models/event-status';
import { EVENT_STATUS_METADATA } from '@/models/event-status';

/**
 * Obtiene la variante de badge para un estado
 * Compatible con shadcn/ui Badge component
 * 
 * @param status - Estado del evento
 * @returns Variante del badge
 * 
 * @example
 * <Badge variant={getStatusBadgeVariant(event.status)}>
 *   {getStatusLabel(event.status)}
 * </Badge>
 */
export function getStatusBadgeVariant(
  status: EventStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants: Record<EventStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    SOLICITADO: 'secondary',    // Gris
    EN_REVISION: 'default',     // Azul
    RESERVADO: 'outline',       // Outline amarillo
    APROBADO: 'default',        // Verde (se manejará con className custom)
    RECHAZADO: 'destructive',   // Rojo
  };

  return variants[status] || 'secondary';
}

/**
 * Obtiene el label en español para un estado
 * 
 * @param status - Estado del evento
 * @returns Label traducido
 * 
 * @example
 * getStatusLabel('APROBADO') // 'Aprobado'
 */
export function getStatusLabel(status: EventStatus): string {
  return EVENT_STATUS_METADATA[status].label;
}

/**
 * Obtiene una descripción detallada del estado
 * 
 * @param status - Estado del evento
 * @returns Descripción del estado
 * 
 * @example
 * getStatusDescription('EN_REVISION')
 * // 'El evento está siendo revisado por el personal administrativo'
 */
export function getStatusDescription(status: EventStatus): string {
  const descriptions: Record<EventStatus, string> = {
    SOLICITADO: 'El evento ha sido solicitado y está pendiente de revisión inicial',
    EN_REVISION: 'El evento está siendo revisado por el personal administrativo',
    RESERVADO: 'Los recursos están reservados, pendiente de aprobación final',
    APROBADO: 'El evento ha sido aprobado y confirmado',
    RECHAZADO: 'El evento ha sido rechazado por incumplimiento de requisitos',
  };

  return descriptions[status];
}

/**
 * Obtiene el icono asociado a un estado
 * Usa iconos de lucide-react
 * 
 * @param status - Estado del evento
 * @returns Nombre del icono de lucide-react
 * 
 * @example
 * import { Clock, CheckCircle } from 'lucide-react';
 * const Icon = getStatusIcon('APROBADO') === 'CheckCircle' ? CheckCircle : Clock;
 */
export function getStatusIcon(status: EventStatus): string {
  return EVENT_STATUS_METADATA[status].icon;
}

/**
 * Obtiene el color asociado a un estado
 * 
 * @param status - Estado del evento
 * @returns Color del estado
 */
export function getStatusColor(status: EventStatus): string {
  return EVENT_STATUS_METADATA[status].color;
}

/**
 * Verifica si un estado es final (no permite más transiciones)
 * Estados finales: APROBADO, RECHAZADO
 * 
 * @param status - Estado del evento
 * @returns true si es un estado final
 * 
 * @example
 * if (isFinalStatus(event.status)) {
 *   return <Alert>Este evento no puede ser modificado</Alert>;
 * }
 */
export function isFinalStatus(status: EventStatus): boolean {
  return status === 'APROBADO' || status === 'RECHAZADO';
}

/**
 * Verifica si un evento puede ser editado según su estado
 * Solo se pueden editar eventos en SOLICITADO o EN_REVISION
 * 
 * @param status - Estado del evento
 * @returns true si puede ser editado
 * 
 * @example
 * <Button disabled={!canEditEvent(event.status)}>
 *   Editar Evento
 * </Button>
 */
export function canEditEvent(status: EventStatus): boolean {
  return status === 'SOLICITADO' || status === 'EN_REVISION';
}

/**
 * Verifica si un evento puede ser eliminado según su estado
 * Solo se pueden eliminar eventos en SOLICITADO
 * 
 * @param status - Estado del evento
 * @returns true si puede ser eliminado
 */
export function canDeleteEvent(status: EventStatus): boolean {
  return status === 'SOLICITADO';
}

/**
 * Obtiene el mensaje de confirmación para un cambio de estado
 * 
 * @param currentStatus - Estado actual
 * @param targetStatus - Estado destino
 * @returns Mensaje de confirmación
 * 
 * @example
 * const message = getConfirmationMessage('EN_REVISION', 'APROBADO');
 * // '¿Aprobar el evento "Conferencia 2024"? Esta acción es definitiva.'
 */
export function getConfirmationMessage(
  currentStatus: EventStatus,
  targetStatus: EventStatus
): string {
  const messages: Record<EventStatus, string> = {
    APROBADO: '¿Aprobar el evento? Esta acción es definitiva.',
    RECHAZADO: '¿Rechazar el evento? Debe proporcionar un motivo. Esta acción es definitiva.',
    RESERVADO: '¿Reservar recursos para este evento?',
    EN_REVISION: '¿Enviar el evento a revisión?',
    SOLICITADO: '¿Marcar el evento como solicitado?',
  };

  return messages[targetStatus];
}

/**
 * Obtiene el mensaje de éxito después de cambiar un estado
 * 
 * @param newStatus - Nuevo estado del evento
 * @returns Mensaje de éxito
 * 
 * @example
 * const message = getSuccessMessage('APROBADO');
 * toast.success(message);
 */
export function getSuccessMessage(newStatus: EventStatus): string {
  const messages: Record<EventStatus, string> = {
    SOLICITADO: 'Evento marcado como solicitado',
    EN_REVISION: 'Evento enviado a revisión',
    RESERVADO: 'Recursos reservados exitosamente',
    APROBADO: '¡Evento aprobado exitosamente!',
    RECHAZADO: 'Evento rechazado',
  };

  return messages[newStatus];
}

/**
 * Obtiene clases de Tailwind para el background según el estado
 * 
 * @param status - Estado del evento
 * @returns Clases de Tailwind
 * 
 * @example
 * <div className={getStatusBackgroundClass('APROBADO')}>
 *   Aprobado
 * </div>
 */
export function getStatusBackgroundClass(status: EventStatus): string {
  const classes: Record<EventStatus, string> = {
    SOLICITADO: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    EN_REVISION: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    RESERVADO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    APROBADO: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    RECHAZADO: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return classes[status];
}

/**
 * Obtiene clases de Tailwind para el borde según el estado
 * 
 * @param status - Estado del evento
 * @returns Clases de Tailwind para border
 */
export function getStatusBorderClass(status: EventStatus): string {
  const classes: Record<EventStatus, string> = {
    SOLICITADO: 'border-gray-300 dark:border-gray-600',
    EN_REVISION: 'border-blue-300 dark:border-blue-600',
    RESERVADO: 'border-yellow-300 dark:border-yellow-600',
    APROBADO: 'border-green-300 dark:border-green-600',
    RECHAZADO: 'border-red-300 dark:border-red-600',
  };

  return classes[status];
}

/**
 * Obtiene el orden de prioridad para ordenar eventos por estado
 * Útil para sorting: SOLICITADO > EN_REVISION > RESERVADO > APROBADO > RECHAZADO
 * 
 * @param status - Estado del evento
 * @returns Número de prioridad (menor = más prioritario)
 */
export function getStatusSortOrder(status: EventStatus): number {
  const order: Record<EventStatus, number> = {
    SOLICITADO: 1,
    EN_REVISION: 2,
    RESERVADO: 3,
    APROBADO: 4,
    RECHAZADO: 5,
  };

  return order[status];
}

/**
 * Filtra estados para mostrar en selectores según el rol del usuario
 * 
 * @param userRole - Rol del usuario actual
 * @returns Array de estados que el usuario puede usar
 * 
 * @example
 * const allowedStatuses = getStatusesForRole('DOCENTE');
 * // ['SOLICITADO'] (solo puede crear solicitudes)
 */
export function getStatusesForRole(userRole: string): EventStatus[] {
  // Los docentes solo pueden solicitar eventos
  if (userRole === 'DOCENTE') {
    return ['SOLICITADO'];
  }

  // Admin y staff pueden usar todos los estados
  if (userRole === 'ADMIN' || userRole === 'PERSONAL_APOYO') {
    return ['SOLICITADO', 'EN_REVISION', 'RESERVADO', 'APROBADO', 'RECHAZADO'];
  }

  // Por defecto, solo SOLICITADO
  return ['SOLICITADO'];
}
