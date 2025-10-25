import type { 
  PageResponse, 
  SpringPageResponse, 
  CustomPageResponse,
  PaginationParams,
  SortParam
} from '../types/pagination.types';

/**
 * Adapta Spring Page (formato 1) a PageResponse normalizada
 * Usado por: /api/catalogs/*, /api/events
 * 
 * @param springPage - Respuesta raw del backend
 * @param itemAdapter - Función para adaptar cada item individual
 * @returns PageResponse normalizada para el frontend
 */
export function adaptSpringPage<TBackend, TFrontend>(
  springPage: SpringPageResponse<TBackend>,
  itemAdapter: (item: TBackend) => TFrontend
): PageResponse<TFrontend> {
  return {
    content: springPage.content.map(itemAdapter),
    page: {
      number: springPage.number,
      size: springPage.size,
      totalElements: springPage.totalElements,
      totalPages: springPage.totalPages
    },
    first: springPage.first,
    last: springPage.last,
    empty: springPage.empty
  };
}

/**
 * Adapta CustomPageResponse (formato 2) a PageResponse normalizada
 * Usado por: /api/events/{id}/comments, /api/audit/{eventId}
 * 
 * @param customPage - Respuesta raw del backend
 * @param itemAdapter - Función para adaptar cada item individual
 * @param contentKey - Clave donde están los items ('comments' o 'entries')
 * @returns PageResponse normalizada para el frontend
 */
export function adaptCustomPage<TBackend, TFrontend>(
  customPage: CustomPageResponse<TBackend>,
  itemAdapter: (item: TBackend) => TFrontend,
  contentKey: 'comments' | 'auditLogs' = 'comments'
): PageResponse<TFrontend> {
  const items = customPage[contentKey] || [];
  
  return {
    content: items.map(itemAdapter),
    page: {
      number: customPage.page.number,
      size: customPage.page.size,
      totalElements: customPage.page.totalElements,
      totalPages: customPage.page.totalPages
    },
    first: customPage.page.number === 0,
    last: customPage.page.number === customPage.page.totalPages - 1,
    empty: items.length === 0
  };
}

/**
 * Adapta respuesta de auditoría (formato específico) a PageResponse
 * Usado por: /api/audit/{eventId}
 * 
 * @param auditPage - Respuesta de auditoría del backend
 * @param itemAdapter - Función para adaptar cada entrada de auditoría
 * @returns PageResponse normalizada para el frontend
 */
export function adaptAuditPage<TBackend, TFrontend>(
  auditPage: {
    eventId: number;
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    entries: TBackend[];
  },
  itemAdapter: (item: TBackend) => TFrontend
): PageResponse<TFrontend> {
  return {
    content: auditPage.entries.map(itemAdapter),
    page: {
      number: auditPage.currentPage,
      size: auditPage.pageSize,
      totalElements: auditPage.totalElements,
      totalPages: auditPage.totalPages
    },
    first: auditPage.currentPage === 0,
    last: auditPage.currentPage === auditPage.totalPages - 1,
    empty: auditPage.entries.length === 0
  };
}

/**
 * Adapta respuesta de comentarios (formato específico) a PageResponse
 * Usado por: /api/events/{eventId}/comments
 * 
 * @param commentsPage - Respuesta de comentarios del backend
 * @param itemAdapter - Función para adaptar cada comentario
 * @returns PageResponse normalizada para el frontend
 */
export function adaptCommentsPage<TBackend, TFrontend>(
  commentsPage: {
    eventId: number;
    comments: TBackend[];
    page: {
      number: number;
      size: number;
      totalElements: number;
      totalPages: number;
    };
  },
  itemAdapter: (item: TBackend) => TFrontend
): PageResponse<TFrontend> {
  return {
    content: commentsPage.comments.map(itemAdapter),
    page: commentsPage.page,
    first: commentsPage.page.number === 0,
    last: commentsPage.page.number === commentsPage.page.totalPages - 1,
    empty: commentsPage.comments.length === 0
  };
}

/**
 * Construye query string para paginación
 * Convierte PaginationParams a URLSearchParams compatible con Spring Data
 * 
 * @param params - Parámetros de paginación
 * @returns URLSearchParams listo para agregar a URL
 */
export function buildPaginationQuery(params: Partial<PaginationParams>): URLSearchParams {
  const queryParams = new URLSearchParams();
  
  // Page (default 0)
  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString());
  }
  
  // Size (default 20)
  if (params.size !== undefined) {
    queryParams.append('size', params.size.toString());
  }
  
  // Sort multi-campo (puede haber múltiples)
  // Formato: field,direction (ej: date,DESC&sort=name,ASC)
  if (params.sort && params.sort.length > 0) {
    params.sort.forEach(sort => {
      queryParams.append('sort', `${sort.field},${sort.direction}`);
    });
  }
  
  return queryParams;
}

/**
 * Helper para crear SortParam desde UI
 * 
 * @param field - Nombre del campo a ordenar
 * @param direction - Dirección de ordenamiento ('asc' o 'desc')
 * @returns SortParam normalizado para el backend
 */
export function buildSortParam(field: string, direction: 'asc' | 'desc'): SortParam {
  return {
    field,
    direction: direction.toUpperCase() as 'ASC' | 'DESC'
  };
}

/**
 * Helper para crear múltiples SortParams desde objeto
 * 
 * @example
 * buildSortParams({ date: 'desc', priority: 'asc' })
 * // => [{ field: 'date', direction: 'DESC' }, { field: 'priority', direction: 'ASC' }]
 */
export function buildSortParams(sortConfig: Record<string, 'asc' | 'desc'>): SortParam[] {
  return Object.entries(sortConfig).map(([field, direction]) => 
    buildSortParam(field, direction)
  );
}

/**
 * Calcula offset desde page y size
 * Útil para infinite scroll o cálculos manuales
 */
export function calculateOffset(page: number, size: number): number {
  return page * size;
}

/**
 * Calcula número de página desde offset y size
 */
export function calculatePage(offset: number, size: number): number {
  return Math.floor(offset / size);
}

/**
 * Verifica si hay más páginas disponibles
 */
export function hasNextPage<T>(pageResponse: PageResponse<T>): boolean {
  return !pageResponse.last;
}

/**
 * Verifica si hay página anterior
 */
export function hasPreviousPage<T>(pageResponse: PageResponse<T>): boolean {
  return !pageResponse.first;
}

/**
 * Crea respuesta de página vacía
 * Útil para inicializar estados
 */
export function createEmptyPage<T>(): PageResponse<T> {
  return {
    content: [],
    page: {
      number: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0
    },
    first: true,
    last: true,
    empty: true
  };
}
