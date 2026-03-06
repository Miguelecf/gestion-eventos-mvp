/**
 * ===================================================================
 * HOOK: useTechCapacity
 * ===================================================================
 * Hook para obtener capacidad técnica del día actual
 * ===================================================================
 */

import { useQuery } from '@tanstack/react-query';
import { fetchTechCapacity } from '@/services/api/tech';
import { format } from 'date-fns';

/**
 * Hook para obtener capacidad técnica del día actual
 * 
 * Características:
 * - Caché de 3 minutos (staleTime)
 * - Auto-refresh cada 5 minutos
 * - Query key única por día
 * 
 * @returns Query object con data, isLoading, error, refetch
 */
export function useTechCapacity() {
  const today = format(new Date(), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['tech', 'capacity', today],
    queryFn: () => fetchTechCapacity(today),
    staleTime: 3 * 60 * 1000, // 3 minutos
    refetchInterval: 5 * 60 * 1000, // Auto-refresh cada 5 minutos
    refetchOnWindowFocus: true,
    retry: 2,
  });
}
