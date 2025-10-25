import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { catalogsApi } from "@/services/api";
import { filterAndSortSpaces } from "@/utils/catalog-filters";
import type { Space } from "@/services/api";

export interface SpaceSelectProps {
  value: number | null;
  onChange: (spaceId: number | null) => void;
  disabled?: boolean;
  className?: string;
  ariaInvalid?: boolean;
  placeholder?: string;
}

const SpaceSelect = React.forwardRef<HTMLSelectElement, SpaceSelectProps>(
  ({ value, onChange, disabled, className, ariaInvalid, placeholder = "Seleccionar espacio...", ...rest }, ref) => {
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Cargar espacios al montar
    useEffect(() => {
      catalogsApi.getSpaces()
        .then(setSpaces)
        .catch(err => console.error('Error cargando espacios:', err))
        .finally(() => setLoading(false));
    }, []);

    // Filtrar y ordenar espacios
    const filteredSpaces = useMemo(() => {
      return filterAndSortSpaces(spaces, searchQuery);
    }, [spaces, searchQuery]);

    return (
      <div className="space-y-2">
        {/* Input de búsqueda */}
        <input
          type="text"
          placeholder="Buscar espacio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={disabled || loading}
          className={cn(
            "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none",
            "focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "border-input"
          )}
        />

        {/* Select */}
        <select
          ref={ref}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          disabled={disabled || loading}
          aria-invalid={ariaInvalid ? true : undefined}
          className={cn(
            "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none",
            "focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-60",
            ariaInvalid ? "border-red-500" : "border-input",
            className
          )}
          {...rest}
        >
          <option value="">{loading ? "Cargando..." : placeholder}</option>
          {filteredSpaces.map((space) => (
            <option key={space.id} value={space.id}>
              {space.name} - {space.location} (Cap: {space.capacity})
            </option>
          ))}
        </select>
      </div>
    );
  }
);

SpaceSelect.displayName = "SpaceSelect";
export default SpaceSelect;