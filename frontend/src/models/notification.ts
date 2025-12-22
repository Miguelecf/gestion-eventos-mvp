/**
 * ===================================================================
 * MODELOS DEL FRONTEND - NOTIFICACIONES
 * ===================================================================
 * Tipos relacionados con notificaciones in-app persistentes
 * ===================================================================
 */

/**
 * Tipo de Notificación
 */
export const NotificationType = {
  EVENT_STATUS_CHANGED: 'EVENT_STATUS_CHANGED',
  NEW_COMMENT_ON_EVENT: 'NEW_COMMENT_ON_EVENT',
  PRIORITY_CONFLICT_DETECTED: 'PRIORITY_CONFLICT_DETECTED'
} as const;
export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

/**
 * Notificación - Modelo del frontend
 * Coincide con NotificationDto del backend
 */
export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  actionUrl: string | null;
  eventId: number | null;
  commentId: number | null;
  metadata: string | null;
}

/**
 * Contador de notificaciones no leídas
 */
export interface UnreadCount {
  unreadCount: number;
}
