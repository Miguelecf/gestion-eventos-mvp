import type { StateCreator } from 'zustand';
import type { Event } from '@/models/event';

export type CalendarView = 'month' | 'week';

export interface CalendarFilters {
  spaceIds?: number[];
  departmentIds?: number[];
  requiresTech?: boolean;
  showInternal?: boolean;
}

export interface DateRange {
  start: string; // ISO yyyy-MM-dd
  end: string;
  anchor: string; // fecha de referencia
}

export interface CalendarState {
  // Vista
  view: CalendarView;
  
  // Rango visible
  dateRange: DateRange;
  
  // Filtros específicos del calendario
  filters: CalendarFilters;
  
  // Caché de eventos por rango
  eventsCache: Record<string, Event[]>; // key: "start_end"
  
  // Acciones
  setView: (view: CalendarView) => void;
  setDateRange: (start: string, end: string, anchor?: string) => void;
  goToToday: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToDate: (date: string) => void;
  setCalendarFilters: (filters: Partial<CalendarFilters>) => void;
  clearCalendarFilters: () => void;
  toggleShowInternal: () => void;
  calculateDateRange: (anchor: string, view: CalendarView) => DateRange;
  
  setCachedEvents: (key: string, events: Event[]) => void;
  getCachedEvents: (key: string) => Event[] | undefined;
  clearCache: () => void;
}

// Helper: calcular primer día del mes
function getFirstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Helper: calcular último día del mes
function getLastDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

// Helper: calcular primer día de la semana
function getFirstDayOfWeek(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Lunes como primer día
  return new Date(date.getFullYear(), date.getMonth(), diff);
}

// Helper: calcular último día de la semana
function getLastDayOfWeek(date: Date): Date {
  const first = getFirstDayOfWeek(date);
  return new Date(first.getFullYear(), first.getMonth(), first.getDate() + 6);
}

// Helper: formatear fecha a ISO yyyy-MM-dd
function formatISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export const createCalendarSlice: StateCreator<CalendarState> = (set, get) => {
  const today = new Date();
  const initialRange = get()?.calculateDateRange(formatISODate(today), 'month') || {
    start: formatISODate(getFirstDayOfMonth(today)),
    end: formatISODate(getLastDayOfMonth(today)),
    anchor: formatISODate(today),
  };

  return {
    // Estado inicial
    view: 'month',
    
    dateRange: initialRange,
    
    filters: {
      showInternal: true, // mostrar eventos internos por defecto
    },
    
    eventsCache: {},
    
    // Acciones de vista
    setView: (view) => {
      const { dateRange } = get();
      const newRange = get().calculateDateRange(dateRange.anchor, view);
      set({ view, dateRange: newRange });
    },
    
    setDateRange: (start, end, anchor) => {
      set({
        dateRange: {
          start,
          end,
          anchor: anchor || start,
        },
      });
    },
    
    goToToday: () => {
      const today = formatISODate(new Date());
      const { view } = get();
      const newRange = get().calculateDateRange(today, view);
      set({ dateRange: newRange });
    },
    
    goToNext: () => {
      const { view, dateRange } = get();
      const anchor = new Date(dateRange.anchor);
      
      if (view === 'month') {
        anchor.setMonth(anchor.getMonth() + 1);
      } else {
        anchor.setDate(anchor.getDate() + 7);
      }
      
      const newRange = get().calculateDateRange(formatISODate(anchor), view);
      set({ dateRange: newRange });
    },
    
    goToPrevious: () => {
      const { view, dateRange } = get();
      const anchor = new Date(dateRange.anchor);
      
      if (view === 'month') {
        anchor.setMonth(anchor.getMonth() - 1);
      } else {
        anchor.setDate(anchor.getDate() - 7);
      }
      
      const newRange = get().calculateDateRange(formatISODate(anchor), view);
      set({ dateRange: newRange });
    },
    
    goToDate: (date) => {
      const { view } = get();
      const newRange = get().calculateDateRange(date, view);
      set({ dateRange: newRange });
    },
    
    // Acciones de filtros
    setCalendarFilters: (filters) => {
      set((state) => ({
        filters: { ...state.filters, ...filters },
      }));
    },
    
    clearCalendarFilters: () => {
      set({
        filters: { showInternal: true },
      });
    },
    
    toggleShowInternal: () => {
      set((state) => ({
        filters: {
          ...state.filters,
          showInternal: !state.filters.showInternal,
        },
      }));
    },
    
    // Helper: calcular rango según vista
    calculateDateRange: (anchor, view) => {
      const date = new Date(anchor);
      
      if (view === 'month') {
        return {
          start: formatISODate(getFirstDayOfMonth(date)),
          end: formatISODate(getLastDayOfMonth(date)),
          anchor,
        };
      } else {
        return {
          start: formatISODate(getFirstDayOfWeek(date)),
          end: formatISODate(getLastDayOfWeek(date)),
          anchor,
        };
      }
    },
    
    // Caché
    setCachedEvents: (key, events) => {
      set((state) => ({
        eventsCache: { ...state.eventsCache, [key]: events },
      }));
    },
    
    getCachedEvents: (key) => {
      return get().eventsCache[key];
    },
    
    clearCache: () => {
      set({ eventsCache: {} });
    },
  };
};

