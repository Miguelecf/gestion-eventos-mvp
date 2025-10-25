import type { StateCreator } from 'zustand';

export interface Modals {
  createEvent: boolean;
  editEvent: { open: boolean; eventId?: number };
  deleteConfirm: { open: boolean; eventId?: number };
  changeStatus: { open: boolean; eventId?: number };
  viewComments: { open: boolean; eventId?: number };
  viewAudit: { open: boolean; eventId?: number };
  resolvePriority: { open: boolean; conflictIds?: number[] };
  techCapacity: { open: boolean; date?: string };
  toggleInternalConfirm: { open: boolean; eventId?: number };
}

export interface UiState {
  // Sidebar
  sidebarOpen: boolean;
  
  // Modales
  modals: Modals;
  
  // Loading states
  loading: Record<string, boolean>;
  
  // Acciones
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Modales genéricos
  openModal: <K extends keyof Modals>(modal: K, data?: Modals[K] extends boolean ? never : Omit<Modals[K], 'open'>) => void;
  closeModal: (modal: keyof Modals) => void;
  closeAllModals: () => void;
  
  // Helpers específicos de modales
  openCreateEvent: () => void;
  openEditEvent: (eventId: number) => void;
  openDeleteConfirm: (eventId: number) => void;
  openChangeStatus: (eventId: number) => void;
  openViewComments: (eventId: number) => void;
  openViewAudit: (eventId: number) => void;
  openResolvePriority: (conflictIds: number[]) => void;
  openTechCapacity: (date?: string) => void;
  openToggleInternalConfirm: (eventId: number) => void;
  
  // Loading
  setLoading: (key: string, loading: boolean) => void;
  isLoading: (key: string) => boolean;
  clearLoading: () => void;
}

const initialModalsState: Modals = {
  createEvent: false,
  editEvent: { open: false },
  deleteConfirm: { open: false },
  changeStatus: { open: false },
  viewComments: { open: false },
  viewAudit: { open: false },
  resolvePriority: { open: false },
  techCapacity: { open: false },
  toggleInternalConfirm: { open: false },
};

export const createUiSlice: StateCreator<UiState> = (set, get) => ({
  // Estado inicial
  sidebarOpen: true,
  
  modals: { ...initialModalsState },
  
  loading: {},
  
  // Acciones de sidebar
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },
  
  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },
  
  // Acciones de modales genéricos
  openModal: (modal, data) => {
    set((state) => {
      if (typeof state.modals[modal] === 'boolean') {
        return {
          modals: {
            ...state.modals,
            [modal]: true,
          },
        };
      } else {
        return {
          modals: {
            ...state.modals,
            [modal]: {
              open: true,
              ...data,
            },
          },
        };
      }
    });
  },
  
  closeModal: (modal) => {
    set((state) => {
      const currentValue = state.modals[modal];
      const initialValue = initialModalsState[modal];
      
      if (typeof currentValue === 'boolean') {
        return {
          modals: {
            ...state.modals,
            [modal]: false,
          },
        };
      } else if (typeof initialValue === 'object') {
        return {
          modals: {
            ...state.modals,
            [modal]: { ...initialValue },
          },
        };
      }
      
      return state;
    });
  },
  
  closeAllModals: () => {
    set({ modals: { ...initialModalsState } });
  },
  
  // Helpers específicos
  openCreateEvent: () => {
    get().openModal('createEvent');
  },
  
  openEditEvent: (eventId) => {
    get().openModal('editEvent', { eventId });
  },
  
  openDeleteConfirm: (eventId) => {
    get().openModal('deleteConfirm', { eventId });
  },
  
  openChangeStatus: (eventId) => {
    get().openModal('changeStatus', { eventId });
  },
  
  openViewComments: (eventId) => {
    get().openModal('viewComments', { eventId });
  },
  
  openViewAudit: (eventId) => {
    get().openModal('viewAudit', { eventId });
  },
  
  openResolvePriority: (conflictIds) => {
    get().openModal('resolvePriority', { conflictIds });
  },
  
  openTechCapacity: (date) => {
    get().openModal('techCapacity', { date });
  },
  
  openToggleInternalConfirm: (eventId) => {
    get().openModal('toggleInternalConfirm', { eventId });
  },
  
  // Acciones de loading
  setLoading: (key, loading) => {
    set((state) => ({
      loading: {
        ...state.loading,
        [key]: loading,
      },
    }));
  },
  
  isLoading: (key) => {
    return get().loading[key] || false;
  },
  
  clearLoading: () => {
    set({ loading: {} });
  },
});

