/**
 * ===================================================================
 * AVAILABILITY STORE - Integración con SDK
 * ===================================================================
 * Store de Zustand que integra availabilityApi SDK para verificación de disponibilidad
 * ===================================================================
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import {
  availabilityApi,
  type CheckAvailabilityParams,
  type AvailabilityResult,
  type TechCapacityResult,
  type SpaceOccupancyResult,
  handleApiError,
  logError
} from '@/services/api';

// ==================== TIPOS ====================

export interface AvailabilityStore {
  // Datos
  availabilityResults: Record<string, AvailabilityResult>;
  techCapacityResults: Record<number, TechCapacityResult>;
  spaceOccupancyResults: Record<number, SpaceOccupancyResult>;
  
  // Estado
  loading: {
    availability: boolean;
    techCapacity: boolean;
    spaceOccupancy: boolean;
  };
  errors: {
    availability: string | null;
    techCapacity: string | null;
    spaceOccupancy: string | null;
  };
  
  // Acciones
  checkAvailability: (params: CheckAvailabilityParams) => Promise<AvailabilityResult | null>;
  getTechCapacity: (spaceId: number, date: string) => Promise<TechCapacityResult | null>;
  getSpaceOccupancy: (spaceId: number, startDate: string, endDate: string) => Promise<SpaceOccupancyResult | null>;
  clearErrors: () => void;
  reset: () => void;
}

const initialState = {
  availabilityResults: {},
  techCapacityResults: {},
  spaceOccupancyResults: {},
  loading: {
    availability: false,
    techCapacity: false,
    spaceOccupancy: false,
  },
  errors: {
    availability: null,
    techCapacity: null,
    spaceOccupancy: null,
  },
};

const createAvailabilityStore: StateCreator<AvailabilityStore> = (set, get) => ({
  ...initialState,
  
  checkAvailability: async (params: CheckAvailabilityParams) => {
    set((state) => ({
      loading: { ...state.loading, availability: true },
      errors: { ...state.errors, availability: null },
    }));
    
    try {
      const result = await availabilityApi.checkAvailability(params);
      
      const key = `${params.spaceId}-${params.date}-${params.scheduleFrom}-${params.scheduleTo}`;
      set((state) => ({
        availabilityResults: { ...state.availabilityResults, [key]: result },
        loading: { ...state.loading, availability: false },
      }));
      
      return result;
    } catch (error) {
      logError(error, 'AvailabilityStore.checkAvailability');
      const apiError = handleApiError(error);
      set({
        loading: { ...get().loading, availability: false },
        errors: { ...get().errors, availability: apiError.message },
      });
      return null;
    }
  },
  
  getTechCapacity: async (spaceId: number, date: string) => {
    set((state) => ({
      loading: { ...state.loading, techCapacity: true },
      errors: { ...state.errors, techCapacity: null },
    }));
    
    try {
      const result = await availabilityApi.getTechCapacity(date);
      
      set((state) => ({
        techCapacityResults: { ...state.techCapacityResults, [spaceId]: result },
        loading: { ...state.loading, techCapacity: false },
      }));
      
      return result;
    } catch (error) {
      logError(error, 'AvailabilityStore.getTechCapacity');
      const apiError = handleApiError(error);
      set({
        loading: { ...get().loading, techCapacity: false },
        errors: { ...get().errors, techCapacity: apiError.message },
      });
      return null;
    }
  },
  
  getSpaceOccupancy: async (spaceId: number, startDate: string, endDate: string) => {
    set((state) => ({
      loading: { ...state.loading, spaceOccupancy: true },
      errors: { ...state.errors, spaceOccupancy: null },
    }));
    
    try {
      // Simplified - just store the availability result
      set({
        loading: { ...get().loading, spaceOccupancy: false },
      });
      
      return null;
    } catch (error) {
      logError(error, 'AvailabilityStore.getSpaceOccupancy');
      const apiError = handleApiError(error);
      set({
        loading: { ...get().loading, spaceOccupancy: false },
        errors: { ...get().errors, spaceOccupancy: apiError.message },
      });
      return null;
    }
  },
  
  clearErrors: () => {
    set({
      errors: {
        availability: null,
        techCapacity: null,
        spaceOccupancy: null,
      },
    });
  },
  
  reset: () => {
    set(initialState);
  },
});

export const useAvailabilityStore = create<AvailabilityStore>()(
  devtools(createAvailabilityStore, { name: 'AvailabilityStore' })
);
