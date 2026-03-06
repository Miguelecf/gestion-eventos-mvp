/**
 * ===================================================================
 * HOOK: useSpaces
 * ===================================================================
 * Hook de React Query para obtener la lista de espacios activos.
 * ===================================================================
 */

import { useQuery } from '@tanstack/react-query';
import { catalogsApi } from '@/services/api/catalogs.api';

/**
 * Hook para obtener todos los espacios activos
 * 
 * @returns Query con lista de espacios
 * 
 * @example
 * ```tsx
 * function SpaceFilter() {
 *   const { data: spaces, isLoading } = useSpaces();
 *   return (
 *     <Select>
 *       {spaces?.map(space => (
 *         <SelectItem key={space.id} value={space.id}>{space.name}</SelectItem>
 *       ))}
 *     </Select>
 *   );
 * }
 * ```
 */
export function useSpaces() {
  return useQuery({
    queryKey: ['spaces'],
    queryFn: () => catalogsApi.getSpaces(),
    staleTime: 15 * 60 * 1000, // 15 minutos (los espacios no cambian frecuentemente)
    gcTime: 30 * 60 * 1000, // 30 minutos en caché
  });
}
