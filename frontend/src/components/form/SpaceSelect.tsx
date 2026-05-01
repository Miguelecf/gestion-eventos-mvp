import * as React from "react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { catalogsApi } from "@/services/api";
import type { Space } from "@/services/api";

export interface SpaceSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange"> {
  value: number | null;
  onChange: (spaceId: number | null) => void;
  ariaInvalid?: boolean;
  placeholder?: string;
}

const SpaceSelect = React.forwardRef<HTMLSelectElement, SpaceSelectProps>(
  ({ value, onChange, disabled, className, ariaInvalid, placeholder = "Seleccionar espacio...", ...rest }, ref) => {
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [loading, setLoading] = useState(true);

    // Cargar espacios al montar
    useEffect(() => {
      catalogsApi.getSpaces()
        .then(setSpaces)
        .catch(err => console.error('Error cargando espacios:', err))
        .finally(() => setLoading(false));
    }, []);

    return (
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
          {spaces.map((space) => (
            <option key={space.id} value={space.id}>
              {space.location
                ? `${space.name} - ${space.location} (Cap: ${space.capacity})`
                : (space.label ?? `${space.name} (Cap: ${space.capacity})`)}
            </option>
          ))}
        </select>
    );
  }
);

SpaceSelect.displayName = "SpaceSelect";
export default SpaceSelect;
