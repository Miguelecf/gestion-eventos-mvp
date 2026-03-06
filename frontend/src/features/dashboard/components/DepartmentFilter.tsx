/**
 * ===================================================================
 * COMPONENT: DepartmentFilter
 * ===================================================================
 * Filtro dropdown para seleccionar departamento.
 * Muestra badges con el color del departamento.
 * ===================================================================
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import type { Department } from '@/models/department';

interface DepartmentFilterProps {
  /** Valor actual del filtro (null = todos) */
  value: number | null;
  
  /** Callback cuando cambia la selección */
  onChange: (value: number | null) => void;
  
  /** Lista de departamentos disponibles */
  departments: Department[];
}

/**
 * Filtro por departamento
 * 
 * @example
 * ```tsx
 * <DepartmentFilter
 *   value={filters.departmentId}
 *   onChange={(id) => updateFilter('departmentId', id)}
 *   departments={departments || []}
 * />
 * ```
 */
export function DepartmentFilter({ value, onChange, departments }: DepartmentFilterProps) {
  const handleValueChange = (newValue: string) => {
    if (newValue === 'all') {
      onChange(null);
    } else {
      onChange(parseInt(newValue, 10));
    }
  };

  const getDisplayValue = () => {
    if (value === null) return 'all';
    return value.toString();
  };

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-slate-500 flex-shrink-0" />
      <Select value={getDisplayValue()} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Todos los departamentos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los departamentos</SelectItem>
          {departments.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">
                Departamentos
              </div>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: (dept as any).color || '#64748b' }}
                    />
                    <span>{dept.name}</span>
                  </div>
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
