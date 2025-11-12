/**
 * ===================================================================
 * CATALOGS STORE - Integración con SDK
 * ===================================================================
 * Store de Zustand que integra catalogsApi SDK para gestión de catálogos
 * ===================================================================
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import {
  catalogsApi,
  type Space,
  type Department,
  type PriorityConflict,
  type ConflictsResult,
  type PublicEventRequestInput,
  type PublicRequestResult,
  type SpaceFilters,
  type CreateSpaceInput,
  type UpdateSpaceInput,
  handleApiError,
  logError
} from '@/services/api';

// ==================== TIPOS ====================

export interface CatalogsStore {
  // ============ DATOS ============
  spaces: Space[];
  departments: Department[];
  conflicts: PriorityConflict[];
  
  // ============ PAGINACIÓN ============
  spacesPagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  
  // ============ FILTROS ============
  spacesFilters: {
    q: string;
    active?: boolean;
  };
  
  // ============ ESTADO ============
  loading: {
    spaces: boolean;
    departments: boolean;
    conflicts: boolean;
    decision: boolean;
    publicRequest: boolean;
    createSpace: boolean;
    updateSpace: boolean;
  };
  
  errors: {
    spaces: string | null;
    departments: string | null;
    conflicts: string | null;
    decision: string | null;
    publicRequest: string | null;
    createSpace: string | null;
    updateSpace: string | null;
  };
  
  // ============ ACCIONES ============
  
  // Listar con filtros y paginación
  listSpaces: (filters?: SpaceFilters) => Promise<void>;
  
  // CRUD
  createSpace: (input: CreateSpaceInput) => Promise<Space | null>;
  updateSpace: (id: number, input: UpdateSpaceInput) => Promise<Space | null>;
  toggleActive: (id: number) => Promise<boolean>;
  
  // Filtros
  setSpacesFilters: (filters: Partial<CatalogsStore['spacesFilters']>) => void;
  clearSpacesFilters: () => void;
  
  // Paginación
  setSpacesPage: (page: number) => void;
  setSpacesSize: (size: number) => void;
  
  // Existentes
  fetchSpaces: () => Promise<void>;
  fetchDepartments: () => Promise<void>;
  fetchConflicts: (eventId: number) => Promise<void>;
  makeDecision: (conflictId: number, decision: 'APROBAR' | 'RECHAZAR', reason?: string) => Promise<boolean>;
  submitPublicRequest: (input: PublicEventRequestInput) => Promise<PublicRequestResult | null>;
  clearErrors: () => void;
  reset: () => void;
}

const initialState = {
  spaces: [],
  departments: [],
  conflicts: [],
  spacesPagination: {
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  },
  spacesFilters: {
    q: '',
    active: undefined,
  },
  loading: {
    spaces: false,
    departments: false,
    conflicts: false,
    decision: false,
    publicRequest: false,
    createSpace: false,
    updateSpace: false,
  },
  errors: {
    spaces: null,
    departments: null,
    conflicts: null,
    decision: null,
    publicRequest: null,
    createSpace: null,
    updateSpace: null,
  },
};

const createCatalogsStore: StateCreator<CatalogsStore> = (set, get) => ({
  ...initialState,
  
  // ============ LISTAR ESPACIOS CON PAGINACIÓN ============
  listSpaces: async (filters) => {
    const currentFilters = get().spacesFilters;
    const currentPagination = get().spacesPagination;
    
    const queryFilters: SpaceFilters = {
      q: filters?.q ?? currentFilters.q,
      active: filters?.active ?? currentFilters.active,
      page: filters?.page ?? currentPagination.page,
      size: filters?.size ?? currentPagination.size,
    };
    
    set((state) => ({
      loading: { ...state.loading, spaces: true },
      errors: { ...state.errors, spaces: null },
      spacesFilters: {
        q: queryFilters.q || '',
        active: queryFilters.active,
      },
    }));
    
    try {
      const page = await catalogsApi.listSpaces(queryFilters);
      
      set({
        spaces: page.content,
        spacesPagination: {
          page: page.page.number,
          size: page.page.size,
          totalElements: page.page.totalElements,
          totalPages: page.page.totalPages,
        },
        loading: { ...get().loading, spaces: false },
      });
    } catch (error) {
      logError(error, 'CatalogsStore.listSpaces');
      const apiError = handleApiError(error);
      set({
        loading: { ...get().loading, spaces: false },
        errors: { ...get().errors, spaces: apiError.message },
      });
    }
  },
  
  // ============ CREAR ESPACIO ============
  createSpace: async (input) => {
    set((state) => ({
      loading: { ...state.loading, createSpace: true },
      errors: { ...state.errors, createSpace: null },
    }));
    
    try {
      const newSpace = await catalogsApi.createSpace(input);
      
      // Refrescar lista manteniendo filtros
      await get().listSpaces();
      
      set({
        loading: { ...get().loading, createSpace: false },
      });
      
      return newSpace;
    } catch (error) {
      logError(error, 'CatalogsStore.createSpace');
      const apiError = handleApiError(error);
      set({
        loading: { ...get().loading, createSpace: false },
        errors: { ...get().errors, createSpace: apiError.message },
      });
      return null;
    }
  },
  
  // ============ ACTUALIZAR ESPACIO ============
  updateSpace: async (id, input) => {
    set((state) => ({
      loading: { ...state.loading, updateSpace: true },
      errors: { ...state.errors, updateSpace: null },
    }));
    
    try {
      const updatedSpace = await catalogsApi.updateSpace(id, input);
      
      // Actualización optimista en la lista
      set((state) => ({
        spaces: state.spaces.map(s => 
          s.id === id ? updatedSpace : s
        ),
        loading: { ...state.loading, updateSpace: false },
      }));
      
      return updatedSpace;
    } catch (error) {
      logError(error, 'CatalogsStore.updateSpace');
      const apiError = handleApiError(error);
      set({
        loading: { ...get().loading, updateSpace: false },
        errors: { ...get().errors, updateSpace: apiError.message },
      });
      return null;
    }
  },
  
  // ============ TOGGLE ACTIVO ============
  toggleActive: async (id) => {
    const space = get().spaces.find(s => s.id === id);
    if (!space) return false;
    
    const result = await get().updateSpace(id, { active: !space.active });
    return result !== null;
  },
  
  // ============ FILTROS ============
  setSpacesFilters: (filters) => {
    set((state) => ({
      spacesFilters: { ...state.spacesFilters, ...filters },
    }));
    
    // Auto-fetch con nuevos filtros (página 0)
    get().listSpaces({ page: 0 });
  },
  
  clearSpacesFilters: () => {
    set({
      spacesFilters: { q: '', active: undefined },
    });
    get().listSpaces({ page: 0 });
  },
  
  // ============ PAGINACIÓN ============
  setSpacesPage: (page) => {
    get().listSpaces({ page });
  },
  
  setSpacesSize: (size) => {
    get().listSpaces({ page: 0, size });
  },
  
  // ============ FUNCIONES EXISTENTES ============
  fetchSpaces: async () => {
    set((state) => ({
      loading: { ...state.loading, spaces: true },
      errors: { ...state.errors, spaces: null },
    }));
    
    try {
      const spaces = await catalogsApi.getSpaces();
      set({
        spaces,
        loading: { ...get().loading, spaces: false },
      });
    } catch (error) {
      logError(error, 'CatalogsStore.fetchSpaces');
      const apiError = handleApiError(error);
      set({
        loading: { ...get().loading, spaces: false },
        errors: { ...get().errors, spaces: apiError.message },
      });
    }
  },
  
  fetchDepartments: async () => {
    set((state) => ({
      loading: { ...state.loading, departments: true },
      errors: { ...state.errors, departments: null },
    }));
    
    try {
      const departments = await catalogsApi.getDepartments();
      set({
        departments,
        loading: { ...get().loading, departments: false },
      });
    } catch (error) {
      logError(error, 'CatalogsStore.fetchDepartments');
      const apiError = handleApiError(error);
      set({
        loading: { ...get().loading, departments: false },
        errors: { ...get().errors, departments: apiError.message },
      });
    }
  },
  
  fetchConflicts: async (eventId: number) => {
    set((state) => ({
      loading: { ...state.loading, conflicts: true },
      errors: { ...state.errors, conflicts: null },
    }));
    
    try {
      const result: ConflictsResult = await catalogsApi.getConflicts({ eventId });
      set({
        conflicts: result.conflicts,
        loading: { ...get().loading, conflicts: false },
      });
    } catch (error) {
      logError(error, 'CatalogsStore.fetchConflicts');
      const apiError = handleApiError(error);
      set({
        loading: { ...get().loading, conflicts: false },
        errors: { ...get().errors, conflicts: apiError.message },
      });
    }
  },
  
  makeDecision: async (conflictId: number, decision: 'APROBAR' | 'RECHAZAR', reason?: string) => {
    set((state) => ({
      loading: { ...state.loading, decision: true },
      errors: { ...state.errors, decision: null },
    }));
    
    try {
      await catalogsApi.makeDecision({ conflictId, decision: decision as any, reason });
      set({
        loading: { ...get().loading, decision: false },
      });
      return true;
    } catch (error) {
      logError(error, 'CatalogsStore.makeDecision');
      const apiError = handleApiError(error);
      set({
        loading: { ...get().loading, decision: false },
        errors: { ...get().errors, decision: apiError.message },
      });
      return false;
    }
  },
  
  submitPublicRequest: async (input: PublicEventRequestInput) => {
    set((state) => ({
      loading: { ...state.loading, publicRequest: true },
      errors: { ...state.errors, publicRequest: null },
    }));
    
    try {
      const result = await catalogsApi.submitPublicRequest(input);
      set({
        loading: { ...get().loading, publicRequest: false },
      });
      return result;
    } catch (error) {
      logError(error, 'CatalogsStore.submitPublicRequest');
      const apiError = handleApiError(error);
      set({
        loading: { ...get().loading, publicRequest: false },
        errors: { ...get().errors, publicRequest: apiError.message },
      });
      return null;
    }
  },
  
  clearErrors: () => {
    set({
      errors: {
        spaces: null,
        departments: null,
        conflicts: null,
        decision: null,
        publicRequest: null,
        createSpace: null,
        updateSpace: null,
      },
    });
  },
  
  reset: () => {
    set(initialState);
  },
});

export const useCatalogsStore = create<CatalogsStore>()(
  devtools(createCatalogsStore, { name: 'CatalogsStore' })
);
