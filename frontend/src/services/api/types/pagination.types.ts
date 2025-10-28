/**
 * Parámetros de paginación estandarizados para el frontend
 */
export interface PaginationParams {
  page: number;        // Base 0 (Spring Data default)
  size: number;        // Default 20
  sort?: SortParam[];
}

/**
 * Ordenamiento multi-campo
 */
export interface SortParam {
  field: string;
  direction: 'ASC' | 'DESC';
}

/**
 * Respuesta paginada normalizada del frontend
 * Estructura unificada para todas las respuestas paginadas
 */
export interface PageResponse<T> {
  content: T[];
  page: {
    number: number;       // Número de página actual (base 0)
    size: number;         // Tamaño de página
    totalElements: number; // Total de elementos
    totalPages: number;   // Total de páginas
  };
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * Respuesta Spring Page del backend (Formato 1)
 * Usado por: /api/catalogs/*, /api/events
 */
export interface SpringPageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
}

/**
 * Respuesta de comentarios/auditoría paginados (Formato 2)
 * Usado por: /api/events/{id}/comments, /api/audit/{eventId}
 */
export interface CustomPageResponse<T> {
  eventId: number;
  comments?: T[];        // Para comentarios
  auditLogs?: T[];       // Para auditoría (alternativa)
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

/**
 * Tipo genérico para trabajar con cualquier formato de paginación
 */
export type AnyPageResponse<T> = SpringPageResponse<T> | CustomPageResponse<T>;
