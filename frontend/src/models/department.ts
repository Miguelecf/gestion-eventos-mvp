/**
 * Department Model
 * 
 * Representa un departamento solicitante de eventos.
 * Los departamentos son catalogados con un nombre único y un color identificador.
 */

export interface Department {
  id: number;
  name: string;
  colorHex: string;
  active: boolean;
  isAvailable?: boolean; // Alias de active para compatibilidad con selects
}

export type CreateDepartmentInput = {
  name: string;
  colorHex?: string;
  active?: boolean;
};

export type UpdateDepartmentInput = Partial<CreateDepartmentInput>;

export interface DepartmentFilters {
  q?: string;
  active?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}
