import type { StateCreator } from 'zustand';
import type { Event, EventFilters, SortConfig, PaginationState } from '@/models/event';
import type { PresetName } from './presets';
import { PRESETS, getPresetConfig } from './presets';
import { parseSearchParams, serializeToSearchParams } from '@/utils/url-params';

export interface EventsState {
  // Filtros
  filters: EventFilters;
  
  // Paginación
  pagination: PaginationState;
  
  // Ordenamiento (array para multi-columna)
  sort: SortConfig[];
  
  // Preset activo
  activePreset: PresetName | null;
  
  // Caché de eventos (opcional)
  cachedEvents: Record<string, Event[]>;
  
  // Acciones
  setFilters: (filters: Partial<EventFilters>) => void;
  clearFilters: () => void;
  resetFilters: () => void;
  
  setSort: (sorts: SortConfig[]) => void;
  addSort: (field: SortConfig['field'], order: SortConfig['order']) => void;
  removeSort: (field: SortConfig['field']) => void;
  
  setPage: (page: number) => void;
  setPageSize: (size: PaginationState['pageSize']) => void;
  nextPage: () => void;
  prevPage: () => void;
  setTotal: (total: number) => void;
  resetPagination: () => void;
  
  applyPreset: (preset: PresetName) => void;
  syncFromURL: (params: URLSearchParams) => void;
  getURLParams: () => URLSearchParams;
  
  setCachedEvents: (key: string, events: Event[]) => void;
  getCachedEvents: (key: string) => Event[] | undefined;
  clearCache: () => void;
}

export const createEventsSlice: StateCreator<EventsState> = (set, get) => ({
  // Estado inicial
  filters: {},
  
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
  
  sort: PRESETS.default.sort,
  
  activePreset: null,
  
  cachedEvents: {},
  
  // Acciones de filtros
  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 }, // reset a página 1
    }));
  },
  
  clearFilters: () => {
    set({
      filters: {},
      pagination: { ...get().pagination, page: 1 },
    });
  },
  
  resetFilters: () => {
    const preset = get().activePreset || 'default';
    const config = PRESETS[preset];
    set({
      filters: { ...config.filters },
      pagination: { ...get().pagination, page: 1 },
    });
  },
  
  // Acciones de ordenamiento
  setSort: (sorts) => {
    set({ sort: sorts });
  },
  
  addSort: (field, order) => {
    set((state) => {
      // Remover si ya existe
      const filtered = state.sort.filter(s => s.field !== field);
      return {
        sort: [...filtered, { field, order }],
      };
    });
  },
  
  removeSort: (field) => {
    set((state) => ({
      sort: state.sort.filter(s => s.field !== field),
    }));
  },
  
  // Acciones de paginación
  setPage: (page) => {
    const { pagination } = get();
    if (page >= 1 && page <= pagination.totalPages) {
      set((state) => ({
        pagination: { ...state.pagination, page },
      }));
    }
  },
  
  setPageSize: (pageSize) => {
    set((state) => ({
      pagination: { ...state.pagination, pageSize, page: 1 },
    }));
  },
  
  nextPage: () => {
    const { pagination } = get();
    if (pagination.page < pagination.totalPages) {
      get().setPage(pagination.page + 1);
    }
  },
  
  prevPage: () => {
    const { pagination } = get();
    if (pagination.page > 1) {
      get().setPage(pagination.page - 1);
    }
  },
  
  setTotal: (total) => {
    set((state) => {
      const totalPages = Math.ceil(total / state.pagination.pageSize);
      return {
        pagination: { ...state.pagination, total, totalPages },
      };
    });
  },
  
  resetPagination: () => {
    set((state) => ({
      pagination: { ...state.pagination, page: 1 },
    }));
  },
  
  // Presets
  applyPreset: (preset) => {
    const config = getPresetConfig(preset);
    set({
      filters: { ...config.filters },
      sort: [...config.sort],
      pagination: { ...get().pagination, ...config.pagination, total: 0, totalPages: 0 },
      activePreset: preset,
    });
  },
  
  // Sincronización con URL
  syncFromURL: (params) => {
    const parsed = parseSearchParams(params);
    
    const updates: Partial<EventsState> = {};
    
    if (parsed.filters && Object.keys(parsed.filters).length > 0) {
      updates.filters = { ...get().filters, ...parsed.filters };
    }
    
    if (parsed.sort && parsed.sort.length > 0) {
      updates.sort = parsed.sort;
    }
    
    if (parsed.pagination) {
      updates.pagination = { ...get().pagination, ...parsed.pagination };
    }
    
    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },
  
  getURLParams: () => {
    const { filters, sort, pagination } = get();
    return serializeToSearchParams({
      filters,
      sort,
      pagination: { page: pagination.page, pageSize: pagination.pageSize },
    });
  },
  
  // Caché
  setCachedEvents: (key, events) => {
    set((state) => ({
      cachedEvents: { ...state.cachedEvents, [key]: events },
    }));
  },
  
  getCachedEvents: (key) => {
    return get().cachedEvents[key];
  },
  
  clearCache: () => {
    set({ cachedEvents: {} });
  },
});

