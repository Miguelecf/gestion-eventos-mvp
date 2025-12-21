/**
 * ===================================================================
 * COMPONENT: SpaceFilter
 * ===================================================================
 * Filtro dropdown para seleccionar espacio.
 * Incluye opciones: Todos, espacios específicos, y "Sin espacio asignado".
 * ===================================================================
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import type { Space } from '@/models/space';

interface SpaceFilterProps {
  /** Valor actual del filtro (null = todos, -1 = sin espacio) */
  value: number | null;
  
  /** Callback cuando cambia la selección */
  onChange: (value: number | null) => void;
  
  /** Lista de espacios disponibles */
  spaces: Space[];
}

/**
 * Filtro por espacio
 * 
 * @example
 * ```tsx
 * <SpaceFilter
 *   value={filters.spaceId}
 *   onChange={(id) => updateFilter('spaceId', id)}
 *   spaces={spaces || []}
 * />
 * ```
 */
export function SpaceFilter({ value, onChange, spaces }: SpaceFilterProps) {
  const handleValueChange = (newValue: string) => {
    if (newValue === 'all') {
      onChange(null);
    } else if (newValue === 'none') {
      onChange(-1);
    } else {
      onChange(parseInt(newValue, 10));
    }
  };

  const getDisplayValue = () => {
    if (value === null) return 'all';
    if (value === -1) return 'none';
    return value.toString();
  };

  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-slate-500 flex-shrink-0" />
      <Select value={getDisplayValue()} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Todos los espacios" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los espacios</SelectItem>
          <SelectItem value="none">Sin espacio asignado</SelectItem>
          {spaces.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">
                Espacios
              </div>
              {spaces.map((space) => (
                <SelectItem key={space.id} value={space.id.toString()}>
                  {space.name}
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
