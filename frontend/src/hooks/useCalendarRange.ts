import { useAppStore } from '@/store';

/**
 * Hook helper para trabajar con rangos del calendario
 * 
 * Proporciona métodos y valores útiles para:
 * - Obtener el rango visible actual
 * - Generar key para caché
 * - Verificar si una fecha está en el rango
 */
export function useCalendarRange() {
  const { dateRange, view } = useAppStore(state => ({
    dateRange: state.dateRange,
    view: state.view,
  }));
  
  /**
   * Genera una key única para el rango actual (útil para caché)
   */
  const getCacheKey = () => {
    return `${dateRange.start}_${dateRange.end}`;
  };
  
  /**
   * Verifica si una fecha está dentro del rango visible
   */
  const isDateInRange = (date: string) => {
    return date >= dateRange.start && date <= dateRange.end;
  };
  
  /**
   * Obtiene el título legible del rango actual
   */
  const getRangeTitle = () => {
    const start = new Date(dateRange.start);
    const anchor = new Date(dateRange.anchor);
    
    if (view === 'month') {
      return anchor.toLocaleDateString('es-ES', { 
        month: 'long', 
        year: 'numeric' 
      });
    } else {
      const end = new Date(dateRange.end);
      const sameMonth = start.getMonth() === end.getMonth();
      
      if (sameMonth) {
        return `${start.getDate()} - ${end.getDate()} de ${start.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
      } else {
        return `${start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      }
    }
  };
  
  /**
   * Calcula el número de días en el rango
   */
  const getDaysCount = () => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };
  
  return {
    dateRange,
    view,
    getCacheKey,
    isDateInRange,
    getRangeTitle,
    getDaysCount,
  };
}

/**
 * Hook helper para formatear fechas
 */
export function useDateFormatter() {
  /**
   * Formatea fecha ISO a formato legible
   */
  const formatDate = (isoDate: string, options?: Intl.DateTimeFormatOptions) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-ES', options || {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  
  /**
   * Formatea hora ISO a formato legible
   */
  const formatTime = (isoTime: string) => {
    // Asumiendo formato "HH:mm:ss" o ISO completo
    const time = isoTime.includes('T') 
      ? new Date(isoTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      : isoTime.substring(0, 5); // Solo HH:mm
    
    return time;
  };
  
  /**
   * Formatea rango de fechas
   */
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const sameDay = start === end;
    const sameMonth = startDate.getMonth() === endDate.getMonth();
    const sameYear = startDate.getFullYear() === endDate.getFullYear();
    
    if (sameDay) {
      return formatDate(start);
    }
    
    if (sameMonth && sameYear) {
      return `${startDate.getDate()} - ${endDate.getDate()} ${startDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
    }
    
    if (sameYear) {
      return `${startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  };
  
  /**
   * Obtiene el nombre del día de la semana
   */
  const getDayName = (isoDate: string, format: 'short' | 'long' = 'long') => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-ES', { 
      weekday: format === 'short' ? 'short' : 'long' 
    });
  };
  
  return {
    formatDate,
    formatTime,
    formatDateRange,
    getDayName,
  };
}
