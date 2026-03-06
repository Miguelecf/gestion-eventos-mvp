/**
 * ===================================================================
 * HOOK: useDepartments
 * ===================================================================
 * Hook de React Query para obtener la lista de departamentos activos.
 * ===================================================================
 */

import { useQuery } from '@tanstack/react-query';
import { catalogsApi } from '@/services/api/catalogs.api';

/**
 * Hook para obtener todos los departamentos activos
 * 
 * @returns Query con lista de departamentos
 * 
 * @example
 * ```tsx
 * function DepartmentFilter() {
 *   const { data: departments, isLoading } = useDepartments();
 *   return (
 *     <Select>
 *       {departments?.map(dept => (
 *         <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
 *       ))}
 *     </Select>
 *   );
 * }
 * ```
 */
export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => catalogsApi.getDepartments(),
    staleTime: 15 * 60 * 1000, // 15 minutos (los departamentos no cambian frecuentemente)
    gcTime: 30 * 60 * 1000, // 30 minutos en caché
  });
}
