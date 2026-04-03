/**
 * Space Model
 * 
 * Representa un espacio físico para eventos.
 * Los espacios tienen capacidad, buffers por defecto y un color identificador.
 */

export interface Space {
  id: number;
  name: string;
  capacity: number;
  location?: string | null;
  colorHex: string;
  defaultBufferBeforeMin: number;
  defaultBufferAfterMin: number;
  active: boolean;
  // Helpers
  label?: string; // "Nombre (Cap: X)"
  isAvailable?: boolean; // Alias de active para compatibilidad con selects
}

export type CreateSpaceInput = {
  name: string;
  capacity: number;
  colorHex?: string;
  defaultBufferBeforeMin: number;
  defaultBufferAfterMin: number;
  active?: boolean;
};

export type UpdateSpaceInput = Partial<CreateSpaceInput>;

export interface SpaceFilters {
  q?: string;           // Búsqueda por nombre
  active?: boolean;     // true=activos, false=inactivos, undefined=todos
  page?: number;
  size?: number;
  sort?: string;
}
