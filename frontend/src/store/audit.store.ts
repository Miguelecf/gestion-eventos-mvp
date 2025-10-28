/**
 * ===================================================================
 * AUDIT STORE - Integración con SDK
 * ===================================================================
 * Store de Zustand que integra auditApi SDK para gestión de auditoría
 * ===================================================================
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import {
  auditApi,
  type GetAuditHistoryParams,
  type AuditSummary,
  type AuditTimeline,
  handleApiError,
  logError
} from '@/services/api';
import type { AuditEntry } from '@/services/api/adapters';
import type { PageResponse } from '@/services/api/types';
import type { AuditActionType } from '@/services/api/types/backend.types';

// ==================== TIPOS ====================

/**
 * Estado de carga async
 */
export interface AuditLoadingState {
  audit: boolean;
  timeline: boolean;
  summary: boolean;
}

/**
 * Estado de errores
 */
export interface AuditErrorState {
  audit: string | null;
  timeline: string | null;
  summary: string | null;
}

/**
 * Store completo de auditoría
 */
export interface AuditStore {
  // ==================== DATOS ====================
  
  /**
   * Historial de auditoría por evento
   */
  auditByEvent: Record<number, AuditEntry[]>;
  
  /**
   * Paginación por evento
   */
  paginationByEvent: Record<number, {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  }>;
  
  /**
   * Timeline agrupado por fecha
   */
  timelineByEvent: Record<number, AuditTimeline[]>;
  
  /**
   * Resumen estadístico por evento
   */
  summaryByEvent: Record<number, AuditSummary>;
  
  // ==================== ESTADO ASYNC ====================
  
  /**
   * Estados de carga
   */
  loading: AuditLoadingState;
  
  /**
   * Errores
   */
  errors: AuditErrorState;
  
  // ==================== ACCIONES SDK ====================
  
  /**
   * Obtener historial de auditoría de un evento
   */
  fetchAuditHistory: (eventId: number, params?: GetAuditHistoryParams) => Promise<void>;
  
  /**
   * Obtener timeline agrupado por fecha
   */
  fetchAuditTimeline: (eventId: number, params?: GetAuditHistoryParams) => Promise<void>;
  
  /**
   * Obtener resumen estadístico
   */
  fetchAuditSummary: (eventId: number, params?: GetAuditHistoryParams) => Promise<void>;
  
  /**
   * Filtrar entradas por acción
   */
  filterByAction: (eventId: number, action: AuditActionType) => AuditEntry[];
  
  /**
   * Filtrar entradas por rango de fechas
   */
  filterByDateRange: (eventId: number, startDate: Date, endDate: Date) => AuditEntry[];
  
  /**
   * Filtrar entradas por usuario
   */
  filterByActor: (eventId: number, actorId: number) => AuditEntry[];
  
  /**
   * Exportar historial
   */
  exportAudit: (eventId: number, format: 'json' | 'csv') => string;
  
  // ==================== ACCIONES UI ====================
  
  /**
   * Limpiar errores
   */
  clearErrors: () => void;
  
  /**
   * Resetear store
   */
  reset: () => void;
}

// ==================== ESTADO INICIAL ====================

const initialState = {
  auditByEvent: {},
  paginationByEvent: {},
  timelineByEvent: {},
  summaryByEvent: {},
  
  loading: {
    audit: false,
    timeline: false,
    summary: false,
  },
  errors: {
    audit: null,
    timeline: null,
    summary: null,
  },
};

// ==================== STORE CREATOR ====================

const createAuditStore: StateCreator<AuditStore> = (set, get) => ({
  ...initialState,
  
  // ==================== ACCIONES SDK ====================
  
  fetchAuditHistory: async (eventId: number, params?: GetAuditHistoryParams) => {
    set((state) => ({
      loading: { ...state.loading, audit: true },
      errors: { ...state.errors, audit: null },
    }));
    
    try {
      const response: PageResponse<AuditEntry> = await auditApi.getAuditHistory(eventId, params);
      
      set((state) => ({
        auditByEvent: {
          ...state.auditByEvent,
          [eventId]: response.content,
        },
        paginationByEvent: {
          ...state.paginationByEvent,
          [eventId]: {
            page: response.page.number + 1,
            size: response.page.size,
            total: response.page.totalElements,
            totalPages: response.page.totalPages,
          },
        },
        loading: { ...state.loading, audit: false },
      }));
    } catch (error) {
      logError(error, 'AuditStore.fetchAuditHistory');
      
      const apiError = handleApiError(error);
      
      set({
        loading: { ...get().loading, audit: false },
        errors: { ...get().errors, audit: apiError.message },
      });
    }
  },
  
  fetchAuditTimeline: async (eventId: number) => {
    set((state) => ({
      loading: { ...state.loading, timeline: true },
      errors: { ...state.errors, timeline: null },
    }));
    
    try {
      const timeline = await auditApi.getTimeline(eventId);
      
      set((state) => ({
        timelineByEvent: {
          ...state.timelineByEvent,
          [eventId]: timeline,
        },
        loading: { ...state.loading, timeline: false },
      }));
    } catch (error) {
      logError(error, 'AuditStore.fetchAuditTimeline');
      
      const apiError = handleApiError(error);
      
      set({
        loading: { ...get().loading, timeline: false },
        errors: { ...get().errors, timeline: apiError.message },
      });
    }
  },
  
  fetchAuditSummary: async (eventId: number) => {
    set((state) => ({
      loading: { ...state.loading, summary: true },
      errors: { ...state.errors, summary: null },
    }));
    
    try {
      const summary = await auditApi.getSummary(eventId);
      
      set((state) => ({
        summaryByEvent: {
          ...state.summaryByEvent,
          [eventId]: summary,
        },
        loading: { ...state.loading, summary: false },
      }));
    } catch (error) {
      logError(error, 'AuditStore.fetchAuditSummary');
      
      const apiError = handleApiError(error);
      
      set({
        loading: { ...get().loading, summary: false },
        errors: { ...get().errors, summary: apiError.message },
      });
    }
  },
  
  filterByAction: (eventId: number, action: AuditActionType) => {
    const entries = get().auditByEvent[eventId] || [];
    return auditApi.filterByAction(entries, [action]);
  },
  
  filterByDateRange: (eventId: number, startDate: Date, endDate: Date) => {
    const entries = get().auditByEvent[eventId] || [];
    return auditApi.filterByDateRange(entries, startDate, endDate);
  },
  
  filterByActor: (eventId: number, actorId: number) => {
    const entries = get().auditByEvent[eventId] || [];
    return auditApi.filterByActor(entries, actorId);
  },
  
  exportAudit: (eventId: number, format: 'json' | 'csv') => {
    const entries = get().auditByEvent[eventId] || [];
    
    if (format === 'json') {
      return JSON.stringify(entries, null, 2);
    }
    
    // CSV format
    if (entries.length === 0) return '';
    
    const headers = ['Fecha', 'Usuario', 'Acción', 'Detalles'];
    const rows = entries.map(entry => [
      new Date(entry.timestamp).toLocaleString(),
      entry.actor.fullName,
      entry.actionType,
      entry.details || ''
    ]);
    
    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  },
  
  // ==================== ACCIONES UI ====================
  
  clearErrors: () => {
    set({
      errors: {
        audit: null,
        timeline: null,
        summary: null,
      },
    });
  },
  
  reset: () => {
    set(initialState);
  },
});

// ==================== CREAR STORE ====================

export const useAuditStore = create<AuditStore>()(
  devtools(createAuditStore, { name: 'AuditStore' })
);
