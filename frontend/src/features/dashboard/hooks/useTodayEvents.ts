/**
 * ===================================================================
 * HOOK: useTodayEvents
 * ===================================================================
 * Hook custom para obtener los eventos del día actual.
 * Utiliza React Query para caché, auto-refresh y gestión de estado.
 * ===================================================================
 */

import { useQuery } from '@tanstack/react-query';
import { fetchEventsByDate } from '@/services/api/events';
import { format } from 'date-fns';

/**
 * Hook para obtener eventos del día actual
 * 
 * Características:
 * - Caché de 3 minutos (staleTime)
 * - Auto-refresh cada 5 minutos
 * - Revalidación al enfocar ventana
 * - Query key única por día para facilitar invalidación
 * 
 * @returns Query object con data, isLoading, error, refetch
 */
export function useTodayEvents() {
  const today = format(new Date(), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['events', 'today', today],
    queryFn: () => fetchEventsByDate(today),
    staleTime: 3 * 60 * 1000, // 3 minutos
    refetchInterval: 5 * 60 * 1000, // Auto-refresh cada 5 minutos
    refetchOnWindowFocus: true,
    retry: 2,
  });
}
