/**
 * ===================================================================
 * NOTIFICATIONS STORE - Integración con SDK y Polling
 * ===================================================================
 * Store de Zustand para gestión de notificaciones in-app persistentes
 * Incluye polling automático del contador de no leídas
 * ===================================================================
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { notificationsApi } from '@/services/api/notifications.api';
import type { Notification } from '@/models/notification';
import type { PageResponse } from '@/services/api/types/pagination.types';

// ==================== CONFIGURACIÓN ====================

const POLLING_INTERVAL = 30000; // 30 segundos

// ==================== TIPOS ====================

/**
 * Estado de carga async
 */
export interface NotificationsLoadingState {
  notifications: boolean;
  unreadCount: boolean;
  markAsRead: boolean;
  markAllAsRead: boolean;
}

/**
 * Store completo de notificaciones
 */
export interface NotificationsStore {
  // ==================== DATOS ====================
  
  /**
   * Lista de notificaciones (últimas 20)
   */
  notifications: Notification[];
  
  /**
   * Contador de no leídas
   */
  unreadCount: number;
  
  /**
   * Paginación actual
   */
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  
  /**
   * Flag para saber si las notificaciones fueron cargadas al menos una vez
   */
  initialized: boolean;
  
  // ==================== ESTADO ASYNC ====================
  
  /**
   * Estados de carga
   */
  loading: NotificationsLoadingState;
  
  /**
   * Error general
   */
  error: string | null;
  
  // ==================== POLLING ====================
  
  /**
   * ID del intervalo de polling (para limpieza)
   */
  pollingIntervalId: number | null;
  
  /**
   * Flag para controlar polling
   */
  isPollingEnabled: boolean;
  
  // ==================== ACCIONES SDK ====================
  
  /**
   * Obtiene el contador de no leídas
   */
  fetchUnreadCount: () => Promise<void>;
  
  /**
   * Obtiene las notificaciones (paginado)
   */
  fetchNotifications: (params?: { page?: number; size?: number }) => Promise<void>;
  
  /**
   * Marca una notificación como leída
   */
  markAsRead: (id: number) => Promise<void>;
  
  /**
   * Marca todas las notificaciones como leídas
   */
  markAllAsRead: () => Promise<void>;
  
  // ==================== ACCIONES DE POLLING ====================
  
  /**
   * Inicia el polling del contador
   */
  startPolling: () => void;
  
  /**
   * Detiene el polling
   */
  stopPolling: () => void;
  
  // ==================== ACCIONES LOCALES ====================
  
  /**
   * Resetea el store al estado inicial
   */
  reset: () => void;
}

// ==================== ESTADO INICIAL ====================

const initialState = {
  notifications: [],
  unreadCount: 0,
  pagination: {
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0
  },
  initialized: false,
  loading: {
    notifications: false,
    unreadCount: false,
    markAsRead: false,
    markAllAsRead: false
  },
  error: null,
  pollingIntervalId: null,
  isPollingEnabled: false
};

// ==================== IMPLEMENTACIÓN DEL STORE ====================

const storeImpl: StateCreator<NotificationsStore> = (set, get) => ({
  ...initialState,
  
  // ==================== FETCH UNREAD COUNT ====================
  
  fetchUnreadCount: async () => {
    try {
      set((state) => ({
        loading: { ...state.loading, unreadCount: true },
        error: null
      }));
      
      const result = await notificationsApi.getUnreadCount();
      
      set((state) => ({
        unreadCount: result.unreadCount,
        loading: { ...state.loading, unreadCount: false }
      }));
    } catch (error) {
      console.error('Error fetching unread count:', error);
      set((state) => ({
        loading: { ...state.loading, unreadCount: false },
        error: error instanceof Error ? error.message : 'Error al obtener contador'
      }));
    }
  },
  
  // ==================== FETCH NOTIFICATIONS ====================
  
  fetchNotifications: async (params = {}) => {
    try {
      set((state) => ({
        loading: { ...state.loading, notifications: true },
        error: null
      }));
      
      const { page = 0, size = 20 } = params;
      const result: PageResponse<Notification> = await notificationsApi.getNotifications({ page, size });
      
      set((state) => ({
        notifications: result.content,
        pagination: {
          page: result.page.number,
          size: result.page.size,
          totalElements: result.page.totalElements,
          totalPages: result.page.totalPages
        },
        initialized: true,
        loading: { ...state.loading, notifications: false }
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set((state) => ({
        loading: { ...state.loading, notifications: false },
        error: error instanceof Error ? error.message : 'Error al cargar notificaciones'
      }));
    }
  },
  
  // ==================== MARK AS READ ====================
  
  markAsRead: async (id: number) => {
    try {
      set((state) => ({
        loading: { ...state.loading, markAsRead: true },
        error: null
      }));
      
      await notificationsApi.markAsRead(id);
      
      // Actualizar localmente
      set((state) => {
        const updatedNotifications = state.notifications.map((notif) =>
          notif.id === id
            ? { ...notif, read: true, readAt: new Date().toISOString() }
            : notif
        );
        
        return {
          notifications: updatedNotifications,
          unreadCount: Math.max(0, state.unreadCount - 1), // Decrementar contador global
          loading: { ...state.loading, markAsRead: false }
        };
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      set((state) => ({
        loading: { ...state.loading, markAsRead: false },
        error: error instanceof Error ? error.message : 'Error al marcar como leída'
      }));
    }
  },
  
  // ==================== MARK ALL AS READ ====================
  
  markAllAsRead: async () => {
    try {
      set((state) => ({
        loading: { ...state.loading, markAllAsRead: true },
        error: null
      }));
      
      await notificationsApi.markAllAsRead();
      
      // Actualizar localmente
      set((state) => ({
        notifications: state.notifications.map((notif) => ({
          ...notif,
          read: true,
          readAt: notif.readAt || new Date().toISOString()
        })),
        unreadCount: 0,
        loading: { ...state.loading, markAllAsRead: false }
      }));
    } catch (error) {
      console.error('Error marking all as read:', error);
      set((state) => ({
        loading: { ...state.loading, markAllAsRead: false },
        error: error instanceof Error ? error.message : 'Error al marcar todas como leídas'
      }));
    }
  },
  
  // ==================== POLLING ====================
  
  startPolling: () => {
    const state = get();
    
    // Si ya está corriendo, no hacer nada
    if (state.pollingIntervalId !== null) {
      console.log('Polling ya está activo');
      return;
    }
    
    // Fetch inmediato al iniciar
    get().fetchUnreadCount();
    
    // Configurar intervalo
    const intervalId = window.setInterval(() => {
      // Solo hacer polling si la pestaña está visible y el usuario autenticado
      if (!document.hidden) {
        get().fetchUnreadCount();
      }
    }, POLLING_INTERVAL);
    
    set({
      pollingIntervalId: intervalId,
      isPollingEnabled: true
    });
    
    console.log('✅ Polling de notificaciones iniciado (cada 30s)');
  },
  
  stopPolling: () => {
    const state = get();
    
    if (state.pollingIntervalId !== null) {
      window.clearInterval(state.pollingIntervalId);
      set({
        pollingIntervalId: null,
        isPollingEnabled: false
      });
      console.log('🛑 Polling de notificaciones detenido');
    }
  },
  
  // ==================== RESET ====================
  
  reset: () => {
    const state = get();
    
    // Detener polling antes de resetear
    if (state.pollingIntervalId !== null) {
      window.clearInterval(state.pollingIntervalId);
    }
    
    set(initialState);
  }
});

// ==================== EXPORT STORE ====================

export const useNotificationsStore = create<NotificationsStore>()(
  devtools(storeImpl, {
    name: 'NotificationsStore',
    enabled: import.meta.env.DEV
  })
);
