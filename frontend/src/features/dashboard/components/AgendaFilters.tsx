/**
 * ===================================================================
 * COMPONENT: AgendaFilters
 * ===================================================================
 * Barra de filtros para la Agenda del Dashboard.
 * Combina todos los filtros disponibles y botón de reset.
 * ===================================================================
 */

import { useAgendaFilters } from '../hooks/useAgendaFilters';
import { useSpaces } from '../hooks/useSpaces';
import { useDepartments } from '../hooks/useDepartments';
import { SpaceFilter } from './SpaceFilter';
import { DepartmentFilter } from './DepartmentFilter';
import { TechRequiredToggle } from './TechRequiredToggle';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

/**
 * Barra de filtros de la Agenda
 * 
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <AgendaFilters />
 *   </CardHeader>
 * </Card>
 * ```
 */
export function AgendaFilters() {
  const { filters, updateFilter, resetFilters, hasActiveFilters } = useAgendaFilters();
  const { data: spaces = [] } = useSpaces();
  const { data: departments = [] } = useDepartments();

  return (
    <div className="flex flex-wrap items-center gap-3 py-3 border-b border-slate-200">
      {/* Filtro de espacio */}
      <SpaceFilter
        value={filters.spaceId}
        onChange={(value) => updateFilter('spaceId', value)}
        spaces={spaces}
      />

      {/* Filtro de departamento */}
      <DepartmentFilter
        value={filters.departmentId}
        onChange={(value) => updateFilter('departmentId', value)}
        departments={departments}
      />

      {/* Toggle de técnica */}
      <TechRequiredToggle
        checked={filters.techRequired}
        onChange={(checked) => updateFilter('techRequired', checked)}
      />

      {/* Botón de limpiar filtros (solo visible si hay filtros activos) */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="ml-auto text-slate-600 hover:text-slate-900"
        >
          <X className="h-4 w-4 mr-1" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
