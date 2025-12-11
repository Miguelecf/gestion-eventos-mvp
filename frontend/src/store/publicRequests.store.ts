/**
 * ===================================================================
 * PUBLIC REQUESTS STORE - Integración con SDK
 * ===================================================================
 * Store de Zustand que integra publicRequestsApi SDK para gestión de solicitudes
 * ===================================================================
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { publicRequestsApi } from '@/services/api/publicRequests.api';
import type {
  PublicEventRequest,
  PublicRequestFilters,
  PaginationState,
} from '@/models/public-request';

// ==================== TIPOS ====================

/**
 * Estado de carga async
 */
export interface LoadingState {
  requests: boolean;
  detail: boolean;
}

/**
 * Estado de errores
 */
export interface ErrorState {
  requests: string | null;
  detail: string | null;
}

/**
 * Store completo de solicitudes públicas
 */
export interface PublicRequestsStore {
  // ==================== DATOS ====================
  
  /**
   * Lista de solicitudes (página actual)
   */
  requests: PublicEventRequest[];
  
  /**
   * Solicitud seleccionada (para detalle)
   */
  selectedRequest: PublicEventRequest | null;
  
  // ==================== ESTADO UI ====================
  
  /**
   * Filtros actuales
   */
  filters: PublicRequestFilters;
  
  /**
   * Paginación
   */
  pagination: PaginationState;
  
  /**
   * Campo de ordenamiento
   */
  sortField: string;
  
  /**
   * Dirección de ordenamiento
   */
  sortDirection: 'asc' | 'desc';
  
  // ==================== ESTADO ASYNC ====================
  
  /**
   * Estados de carga
   */
  loading: LoadingState;
  
  /**
   * Errores
   */
  errors: ErrorState;
  
  /**
   * Timestamp de última actualización
   */
  lastFetch: number | null;
  
  // ==================== ACCIONES SDK ====================
  
  /**
   * Obtener lista de solicitudes con filtros actuales
   */
  fetchRequests: (forceRefresh?: boolean) => Promise<void>;
  
  /**
   * Obtener solicitud por ID
   */
  fetchRequestById: (id: number) => Promise<PublicEventRequest | null>;
  
  // ==================== ACCIONES UI ====================
  
  /**
   * Actualizar filtros
   */
  setFilters: (filters: Partial<PublicRequestFilters>) => void;
  
  /**
   * Limpiar filtros
   */
  clearFilters: () => void;
  
  /**
   * Cambiar página
   */
  setPage: (page: number) => void;
  
  /**
   * Cambiar tamaño de página
   */
  setPageSize: (size: number) => void;
  
  /**
   * Cambiar ordenamiento
   */
  setSort: (field: string, direction: 'asc' | 'desc') => void;
  
  /**
   * Seleccionar solicitud
   */
  selectRequest: (request: PublicEventRequest | null) => void;
  
  /**
   * Limpiar errores
   */
  clearErrors: () => void;
  
  /**
   * Reset completo del store
   */
  reset: () => void;
}

// ==================== ESTADO INICIAL ====================

const initialFilters: PublicRequestFilters = {
  search: undefined,
  status: ['RECIBIDO', 'EN_REVISION'], // Por defecto: mostrar nuevas y en revisión
  dateFrom: undefined,
  dateTo: undefined,
  requiresTech: undefined,
  audienceType: undefined,
  spaceIds: undefined,
  departmentIds: undefined,
};

const initialPagination: PaginationState = {
  page: 0,
  pageSize: 20,
  totalElements: 0,
  totalPages: 0,
};

const initialLoading: LoadingState = {
  requests: false,
  detail: false,
};

const initialErrors: ErrorState = {
  requests: null,
  detail: null,
};

// ==================== HELPERS ====================

/**
 * Construye el query string para ordenamiento
 */
function buildSortQuery(field: string, direction: 'asc' | 'desc'): string {
  return `${field},${direction}`;
}

/**
 * Maneja errores de API y los convierte a string
 */
function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Error desconocido';
}

// ==================== STORE ====================

const storeCreator: StateCreator<PublicRequestsStore> = (set, get) => ({
  // ==================== ESTADO INICIAL ====================
  
  requests: [],
  selectedRequest: null,
  filters: initialFilters,
  pagination: initialPagination,
  sortField: 'requestDate',
  sortDirection: 'desc',
  loading: initialLoading,
  errors: initialErrors,
  lastFetch: null,
  
  // ==================== ACCIONES SDK ====================
  
  fetchRequests: async (forceRefresh = false) => {
    const { filters, pagination, sortField, sortDirection, lastFetch } = get();
    
    // Caché simple: no refetch si fue hace menos de 30s
    if (!forceRefresh && lastFetch && Date.now() - lastFetch < 30000) {
      return;
    }
    
    set((state) => ({
      loading: { ...state.loading, requests: true },
      errors: { ...state.errors, requests: null },
    }));
    
    try {
      const response = await publicRequestsApi.getPublicRequests({
        page: pagination.page,
        size: pagination.pageSize,
        sort: buildSortQuery(sortField, sortDirection),
        search: filters.search,
        status: filters.status?.join(','),
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        requiresTech: filters.requiresTech,
      });
      
      set({
        requests: response.content,
        pagination: {
          page: response.page.number,
          pageSize: response.page.size,
          totalElements: response.page.totalElements,
          totalPages: response.page.totalPages,
        },
        lastFetch: Date.now(),
        loading: { ...get().loading, requests: false },
      });
    } catch (error) {
      set({
        loading: { ...get().loading, requests: false },
        errors: { ...get().errors, requests: handleError(error) },
      });
    }
  },
  
  fetchRequestById: async (id: number) => {
    set((state) => ({
      loading: { ...state.loading, detail: true },
      errors: { ...state.errors, detail: null },
    }));
    
    try {
      const request = await publicRequestsApi.getPublicRequestById(id);
      
      set({
        selectedRequest: request,
        loading: { ...get().loading, detail: false },
      });
      
      return request;
    } catch (error) {
      set({
        loading: { ...get().loading, detail: false },
        errors: { ...get().errors, detail: handleError(error) },
      });
      return null;
    }
  },
  
  // ==================== ACCIONES UI ====================
  
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 0 }, // Reset a página 1
    }));
    
    // Auto-fetch cuando cambian filtros
    get().fetchRequests(true);
  },
  
  clearFilters: () => {
    set({
      filters: initialFilters,
      pagination: { ...get().pagination, page: 0 },
    });
    
    get().fetchRequests(true);
  },
  
  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
    
    get().fetchRequests(true);
  },
  
  setPageSize: (size) => {
    set((state) => ({
      pagination: { ...state.pagination, pageSize: size, page: 0 },
    }));
    
    get().fetchRequests(true);
  },
  
  setSort: (field, direction) => {
    set({
      sortField: field,
      sortDirection: direction,
      pagination: { ...get().pagination, page: 0 },
    });
    
    get().fetchRequests(true);
  },
  
  selectRequest: (request) => {
    set({ selectedRequest: request });
  },
  
  clearErrors: () => {
    set({ errors: initialErrors });
  },
  
  reset: () => {
    set({
      requests: [],
      selectedRequest: null,
      filters: initialFilters,
      pagination: initialPagination,
      sortField: 'requestDate',
      sortDirection: 'desc',
      loading: initialLoading,
      errors: initialErrors,
      lastFetch: null,
    });
  },
});

// ==================== EXPORT ====================

export const usePublicRequestsStore = create<PublicRequestsStore>()(
  devtools(storeCreator, { name: 'PublicRequestsStore' })
);
