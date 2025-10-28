import { useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/store';

/**
 * Hook simple de debounce
 */
function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]) as T;
}

/**
 * Hook para sincronizar el estado del store con la URL
 * 
 * Características:
 * - Lee querystring al montar el componente
 * - Escribe querystring al cambiar filtros/paginación (debounced)
 * - Evita historial excesivo usando replace
 * 
 * @param options Opciones de configuración
 */
export function useUrlSync(options: {
  enabled?: boolean;
  debounceMs?: number;
} = {}) {
  const { enabled = true, debounceMs = 300 } = options;
  
  const [searchParams, setSearchParams] = useSearchParams();
  const isFirstMount = useRef(true);
  
  // Selectores del store
  const filters = useAppStore(state => state.filters);
  const sort = useAppStore(state => state.sort);
  const pagination = useAppStore(state => state.pagination);
  const syncFromURL = useAppStore(state => state.syncFromURL);
  const getURLParams = useAppStore(state => state.getURLParams);
  
  // Al montar: leer URL y actualizar store (solo una vez)
  useEffect(() => {
    if (!enabled || !isFirstMount.current) return;
    
    isFirstMount.current = false;
    syncFromURL(searchParams);
  }, []); // Solo en mount
  
  // Al cambiar store: actualizar URL (debounced)
  const updateURL = useDebouncedCallback(() => {
    if (!enabled) return;
    
    const params = getURLParams();
    setSearchParams(params, { replace: true });
  }, debounceMs);
  
  useEffect(() => {
    if (isFirstMount.current) return; // No actualizar en el primer render
    
    updateURL();
  }, [filters, sort, pagination.page, pagination.pageSize]);
  
  return {
    searchParams,
    setSearchParams,
  };
}

/**
 * Hook para sincronizar calendario con URL
 */
export function useCalendarUrlSync(options: {
  enabled?: boolean;
  debounceMs?: number;
} = {}) {
  const { enabled = true, debounceMs = 300 } = options;
  
  const [searchParams, setSearchParams] = useSearchParams();
  const isFirstMount = useRef(true);
  
  const view = useAppStore(state => state.view);
  const dateRange = useAppStore(state => state.dateRange);
  const setView = useAppStore(state => state.setView);
  const goToDate = useAppStore(state => state.goToDate);
  
  // Al montar: leer URL
  useEffect(() => {
    if (!enabled || !isFirstMount.current) return;
    
    isFirstMount.current = false;
    
    const urlView = searchParams.get('view');
    if (urlView === 'month' || urlView === 'week') {
      setView(urlView);
    }
    
    const urlDate = searchParams.get('date');
    if (urlDate) {
      goToDate(urlDate);
    }
  }, []);
  
  // Al cambiar store: actualizar URL
  const updateURL = useDebouncedCallback(() => {
    if (!enabled) return;
    
    const params = new URLSearchParams(searchParams);
    
    if (view !== 'month') {
      params.set('view', view);
    } else {
      params.delete('view');
    }
    
    if (dateRange.anchor) {
      params.set('date', dateRange.anchor);
    }
    
    setSearchParams(params, { replace: true });
  }, debounceMs);
  
  useEffect(() => {
    if (isFirstMount.current) return;
    
    updateURL();
  }, [view, dateRange.anchor]);
  
  return {
    searchParams,
    setSearchParams,
  };
}
