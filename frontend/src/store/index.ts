import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { defineAbilityFor, type AppAbility } from '@/libs/ability';
import { createEventsSlice, type EventsState } from './events.slice';
import { createCalendarSlice, type CalendarState } from './calendar.slice';
import { createUiSlice, type UiState } from './ui.slice';

// ==================== FASE 4 TAREA 14: NUEVOS STORES ====================
// Stores independientes que integran SDKs de Fase 3
export { useEventsStore, type EventsStore } from './events.store';
export { useCommentsStore, type CommentsStore } from './comments.store';
export { useAuditStore, type AuditStore } from './audit.store';
export { useAvailabilityStore, type AvailabilityStore } from './availability.store';
export { useCatalogsStore, type CatalogsStore } from './catalogs.store';

// Re-export presets
export { PRESETS, getPresetConfig, type PresetName } from './presets';
// =====================================================================

interface AuthState {
  token: string | null;
  userId: string | null;
  roles: string[];
  ability: AppAbility | null;
  setAuth: (token: string, userId: string, roles: string[]) => void;
  clearAuth: () => void;
}

type RootState = AuthState & UiState & EventsState & CalendarState;

export const useAppStore = create<RootState>()(
  devtools(
    persist(
      (set, get) => ({
        // Auth
        token: null,
        userId: null,
        roles: [],
        ability: null,
        
        setAuth: (token, userId, roles) => {
          const ability = defineAbilityFor(roles, userId);
          set({ token, userId, roles, ability });
        },
        
        clearAuth: () => set({ 
          token: null, 
          userId: null, 
          roles: [], 
          ability: null 
        }),

        // Combinar slices
        ...createUiSlice(set, get, get as any),
        ...createEventsSlice(set, get, get as any),
        ...createCalendarSlice(set, get, get as any),
      }),
      { 
        name: 'app-storage',
        partialize: (state) => ({ 
          token: state.token, 
          userId: state.userId, 
          roles: state.roles,
          sidebarOpen: state.sidebarOpen,
          filters: state.filters,
          sort: state.sort,
          pagination: { 
            page: state.pagination.page, 
            pageSize: state.pagination.pageSize 
          },
          view: state.view,
          activePreset: state.activePreset,
        }),
        
        // Regenerar ability al hidratar desde localStorage
        onRehydrateStorage: () => (state) => {
          if (state?.userId && state?.roles && state.roles.length > 0) {
            state.ability = defineAbilityFor(state.roles, state.userId);
          }
        },
      }
    ),
    { name: 'AppStore' }
  )
);