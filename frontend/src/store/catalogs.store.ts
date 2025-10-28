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
  handleApiError,
  logError
} from '@/services/api';

// ==================== TIPOS ====================

export interface CatalogsStore {
  // Datos
  spaces: Space[];
  departments: Department[];
  conflicts: PriorityConflict[];
  
  // Estado
  loading: {
    spaces: boolean;
    departments: boolean;
    conflicts: boolean;
    decision: boolean;
    publicRequest: boolean;
  };
  errors: {
    spaces: string | null;
    departments: string | null;
    conflicts: string | null;
    decision: string | null;
    publicRequest: string | null;
  };
  
  // Acciones
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
  loading: {
    spaces: false,
    departments: false,
    conflicts: false,
    decision: false,
    publicRequest: false,
  },
  errors: {
    spaces: null,
    departments: null,
    conflicts: null,
    decision: null,
    publicRequest: null,
  },
};

const createCatalogsStore: StateCreator<CatalogsStore> = (set, get) => ({
  ...initialState,
  
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
