/**
 * ===================================================================
 * SDK DE NOTIFICACIONES - API DE ALTO NIVEL
 * ===================================================================
 * Proporciona funciones de alto nivel para gestionar notificaciones.
 * Integra httpClient + manejo de errores.
 * ===================================================================
 */

import { httpClient } from './client';
import type { Notification, UnreadCount } from '@/models/notification';
import type { SpringPageResponse, PageResponse } from './types/pagination.types';
import { adaptSpringPage } from './adapters/pagination.adapter';

// ==================== TIPOS ESPECÍFICOS DEL SDK ====================

/**
 * Parámetros de consulta para listar notificaciones
 */
export interface GetNotificationsParams {
  page?: number;
  size?: number;
}

// ==================== ENDPOINTS ====================

const NOTIFICATIONS_BASE = '/api/notifications';

// ==================== API PÚBLICA ====================

/**
 * Obtiene el contador de notificaciones no leídas del usuario actual
 * 
 * @returns Contador de no leídas
 * @throws Error si la petición falla
 * 
 * @example
 * ```ts
 * const { unreadCount } = await notificationsApi.getUnreadCount();
 * console.log(`Tienes ${unreadCount} notificaciones sin leer`);
 * ```
 */
export async function getUnreadCount(): Promise<UnreadCount> {
  return await httpClient.get<UnreadCount>(`${NOTIFICATIONS_BASE}/count/unread`);
}

/**
 * Obtiene las notificaciones recientes del usuario actual (paginado)
 * 
 * @param params - Parámetros de paginación
 * @returns Página de notificaciones ordenadas por fecha desc
 * @throws Error si la petición falla
 * 
 * @example
 * ```ts
 * const page = await notificationsApi.getNotifications({ page: 0, size: 20 });
 * console.log(page.content); // Array de notificaciones
 * ```
 */
export async function getNotifications(
  params: GetNotificationsParams = {}
): Promise<PageResponse<Notification>> {
  const { page = 0, size = 20 } = params;
  
  const response = await httpClient.get<SpringPageResponse<Notification>>(
    NOTIFICATIONS_BASE,
    {
      params: {
        page,
        size
      }
    }
  );
  
  // Adapter identity: las notificaciones ya vienen en el formato correcto
  return adaptSpringPage(response, (notification) => notification);
}

/**
 * Marca una notificación específica como leída
 * 
 * @param id - ID de la notificación
 * @throws Error si la petición falla o la notificación no pertenece al usuario
 * 
 * @example
 * ```ts
 * await notificationsApi.markAsRead(123);
 * ```
 */
export async function markAsRead(id: number): Promise<void> {
  await httpClient.patch(`${NOTIFICATIONS_BASE}/${id}/read`);
}

/**
 * Marca todas las notificaciones del usuario como leídas
 * 
 * @throws Error si la petición falla
 * 
 * @example
 * ```ts
 * await notificationsApi.markAllAsRead();
 * ```
 */
export async function markAllAsRead(): Promise<void> {
  await httpClient.patch(`${NOTIFICATIONS_BASE}/read-all`);
}

// ==================== EXPORT DEFAULT ====================

export const notificationsApi = {
  getUnreadCount,
  getNotifications,
  markAsRead,
  markAllAsRead
};
