/**
 * ===================================================================
 * SELECTOR DE ESPACIOS PÚBLICOS
 * ===================================================================
 * Selector dropdown para espacios disponibles en solicitudes públicas.
 * Solo muestra espacios con `publishable = true`.
 * ===================================================================
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { publicRequestsApi } from '@/services/api';
import type { PublicSpaceListItem } from '@/services/api';

export interface PublicSpaceSelectProps {
  value?: number | null;
  onChange: (spaceId: number | null) => void;
  disabled?: boolean;
  className?: string;
  ariaInvalid?: boolean;
  placeholder?: string;
  error?: string;
}

const PublicSpaceSelect = React.forwardRef<HTMLSelectElement, PublicSpaceSelectProps>(
  (
    {
      value,
      onChange,
      disabled,
      className,
      ariaInvalid,
      placeholder = 'Seleccionar espacio...',
      error,
      ...rest
    },
    ref
  ) => {
    const [spaces, setSpaces] = useState<PublicSpaceListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Cargar espacios públicos al montar
    useEffect(() => {
      publicRequestsApi
        .getPublicSpaces({ publishableOnly: true })
        .then((data) => {
          // Filtrar solo activos
          const activeSpaces = data.filter((space) => space.active);
          setSpaces(activeSpaces);
          setLoadError(null);
        })
        .catch((err) => {
          console.error('Error cargando espacios públicos:', err);
          setLoadError('No se pudieron cargar los espacios disponibles');
        })
        .finally(() => setLoading(false));
    }, []);

    return (
      <div className="w-full">
        <select
          ref={ref}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          disabled={disabled || loading}
          aria-invalid={ariaInvalid || !!error ? true : undefined}
          className={cn(
            'w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none',
            'focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-60',
            ariaInvalid || error ? 'border-red-500' : 'border-input',
            className
          )}
          {...rest}
        >
          <option value="">
            {loading ? 'Cargando espacios...' : loadError || placeholder}
          </option>
          {!loadError &&
            spaces.map((space) => (
              <option key={space.id} value={space.id}>
                {space.name}
                {space.capacity ? ` - Capacidad: ${space.capacity}` : ''}
              </option>
            ))}
        </select>

        {/* Mensaje de error de carga */}
        {loadError && (
          <p className="text-xs text-red-600 mt-1" role="alert">
            {loadError}
          </p>
        )}

        {/* Información adicional */}
        {!loading && !loadError && spaces.length === 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            No hay espacios disponibles en este momento
          </p>
        )}
      </div>
    );
  }
);

PublicSpaceSelect.displayName = 'PublicSpaceSelect';

export { PublicSpaceSelect };
export default PublicSpaceSelect;
