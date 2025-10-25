/**
 * ===================================================================
 * QUERY BUILDER - Construcción Avanzada de Query Strings
 * ===================================================================
 * Utilidades para construir query strings complejas con filtros,
 * paginación, ordenamiento y búsquedas avanzadas.
 * ===================================================================
 */

import { toBackendDate } from '../adapters';

// ==================== TIPOS ====================

/**
 * Opciones de paginación
 */
export interface PaginationOptions {
  page?: number;
  size?: number;
}

/**
 * Opciones de ordenamiento
 */
export interface SortOptions {
  field: string;
  direction?: 'ASC' | 'DESC';
}

/**
 * Filtro genérico
 */
export interface FilterValue {
  value: any;
  operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'between';
}

/**
 * Opciones de rango de fechas
 */
export interface DateRangeOptions {
  startDate?: string | Date;
  endDate?: string | Date;
}

/**
 * Opciones de búsqueda
 */
export interface SearchOptions {
  query?: string;
  fields?: string[]; // Campos donde buscar
}

// ==================== QUERY BUILDER ====================

/**
 * Constructor de query strings avanzado
 */
export class QueryBuilder {
  private params: URLSearchParams;

  constructor() {
    this.params = new URLSearchParams();
  }

  /**
   * Agrega paginación
   */
  pagination(options: PaginationOptions): this {
    if (options.page !== undefined) {
      this.params.append('page', options.page.toString());
    }
    if (options.size !== undefined) {
      this.params.append('size', options.size.toString());
    }
    return this;
  }

  /**
   * Agrega ordenamiento (puede ser múltiple)
   */
  sort(sorts: SortOptions | SortOptions[]): this {
    const sortArray = Array.isArray(sorts) ? sorts : [sorts];
    
    sortArray.forEach(sort => {
      const direction = sort.direction || 'ASC';
      this.params.append('sort', `${sort.field},${direction}`);
    });
    
    return this;
  }

  /**
   * Agrega un filtro simple
   */
  filter(key: string, value: any): this {
    if (value !== undefined && value !== null && value !== '') {
      // Convertir fechas a formato backend
      if (value instanceof Date) {
        value = toBackendDate(value);
      }
      
      // Manejar arrays (agregar múltiples valores con el mismo key)
      if (Array.isArray(value)) {
        value.forEach(v => this.params.append(key, v.toString()));
      } else {
        this.params.append(key, value.toString());
      }
    }
    return this;
  }

  /**
   * Agrega múltiples filtros desde un objeto
   */
  filters(filters: Record<string, any>): this {
    Object.entries(filters).forEach(([key, value]) => {
      this.filter(key, value);
    });
    return this;
  }

  /**
   * Agrega rango de fechas
   */
  dateRange(options: DateRangeOptions): this {
    if (options.startDate) {
      const date = options.startDate instanceof Date 
        ? toBackendDate(options.startDate)
        : options.startDate;
      this.params.append('startDate', date);
    }
    
    if (options.endDate) {
      const date = options.endDate instanceof Date 
        ? toBackendDate(options.endDate)
        : options.endDate;
      this.params.append('endDate', date);
    }
    
    return this;
  }

  /**
   * Agrega búsqueda
   */
  search(options: SearchOptions): this {
    if (options.query) {
      this.params.append('q', options.query);
      
      if (options.fields && options.fields.length > 0) {
        this.params.append('fields', options.fields.join(','));
      }
    }
    return this;
  }

  /**
   * Agrega un parámetro personalizado
   */
  param(key: string, value: any): this {
    return this.filter(key, value);
  }

  /**
   * Limpia todos los parámetros
   */
  clear(): this {
    this.params = new URLSearchParams();
    return this;
  }

  /**
   * Obtiene el query string como string
   */
  toString(): string {
    return this.params.toString();
  }

  /**
   * Obtiene el query string con '?' prefijo
   */
  toQueryString(): string {
    const str = this.toString();
    return str ? `?${str}` : '';
  }

  /**
   * Obtiene los parámetros como objeto
   */
  toObject(): Record<string, string | string[]> {
    const obj: Record<string, string | string[]> = {};
    
    this.params.forEach((value, key) => {
      const existing = obj[key];
      
      if (existing) {
        // Si ya existe, convertir a array
        if (Array.isArray(existing)) {
          existing.push(value);
        } else {
          obj[key] = [existing, value];
        }
      } else {
        obj[key] = value;
      }
    });
    
    return obj;
  }

  /**
   * Clona el builder actual
   */
  clone(): QueryBuilder {
    const newBuilder = new QueryBuilder();
    this.params.forEach((value, key) => {
      newBuilder.params.append(key, value);
    });
    return newBuilder;
  }
}

// ==================== FUNCIONES HELPER ====================

/**
 * Crea un nuevo QueryBuilder
 */
export function createQueryBuilder(): QueryBuilder {
  return new QueryBuilder();
}

/**
 * Construye query string para paginación básica
 */
export function buildPaginationQuery(
  page: number = 0,
  size: number = 20
): string {
  return createQueryBuilder()
    .pagination({ page, size })
    .toString();
}

/**
 * Construye query string para paginación con sort
 */
export function buildPaginationWithSortQuery(
  page: number = 0,
  size: number = 20,
  sortField: string = 'id',
  sortDirection: 'ASC' | 'DESC' = 'DESC'
): string {
  return createQueryBuilder()
    .pagination({ page, size })
    .sort({ field: sortField, direction: sortDirection })
    .toString();
}

/**
 * Construye query string para filtros de fecha
 */
export function buildDateRangeQuery(
  startDate: string | Date,
  endDate: string | Date,
  additionalFilters?: Record<string, any>
): string {
  const builder = createQueryBuilder().dateRange({ startDate, endDate });
  
  if (additionalFilters) {
    builder.filters(additionalFilters);
  }
  
  return builder.toString();
}

/**
 * Construye query string para búsqueda
 */
export function buildSearchQuery(
  query: string,
  fields?: string[],
  pagination?: PaginationOptions
): string {
  const builder = createQueryBuilder().search({ query, fields });
  
  if (pagination) {
    builder.pagination(pagination);
  }
  
  return builder.toString();
}

/**
 * Parsea query string a objeto
 */
export function parseQueryString(queryString: string): Record<string, string | string[]> {
  const params = new URLSearchParams(queryString);
  const obj: Record<string, string | string[]> = {};
  
  params.forEach((value, key) => {
    const existing = obj[key];
    
    if (existing) {
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        obj[key] = [existing, value];
      }
    } else {
      obj[key] = value;
    }
  });
  
  return obj;
}

/**
 * Combina múltiples query strings
 */
export function mergeQueryStrings(...queryStrings: string[]): string {
  const builder = createQueryBuilder();
  
  queryStrings.forEach(qs => {
    const params = new URLSearchParams(qs);
    params.forEach((value, key) => {
      builder.param(key, value);
    });
  });
  
  return builder.toString();
}

/**
 * Remueve parámetros específicos de un query string
 */
export function removeQueryParams(
  queryString: string,
  paramsToRemove: string[]
): string {
  const params = new URLSearchParams(queryString);
  
  paramsToRemove.forEach(param => {
    params.delete(param);
  });
  
  return params.toString();
}

/**
 * Actualiza un parámetro en un query string existente
 */
export function updateQueryParam(
  queryString: string,
  key: string,
  value: any
): string {
  const params = new URLSearchParams(queryString);
  
  // Remover parámetro existente
  params.delete(key);
  
  // Agregar nuevo valor
  if (value !== undefined && value !== null && value !== '') {
    if (Array.isArray(value)) {
      value.forEach(v => params.append(key, v.toString()));
    } else {
      params.append(key, value.toString());
    }
  }
  
  return params.toString();
}

// ==================== EXPORT DEFAULT ====================

export default {
  createQueryBuilder,
  QueryBuilder,
  buildPaginationQuery,
  buildPaginationWithSortQuery,
  buildDateRangeQuery,
  buildSearchQuery,
  parseQueryString,
  mergeQueryStrings,
  removeQueryParams,
  updateQueryParam
};
