import type { EventFilters, SortConfig, PaginationState } from '@/models/event';

export interface UrlState {
  filters: Partial<EventFilters>;
  sort: SortConfig[];
  pagination: Partial<Pick<PaginationState, 'page' | 'pageSize'>>;
  calendarView?: 'month' | 'week';
  calendarDate?: string; // anchor date
}

/**
 * Parsea URLSearchParams a estado del store
 */
export function parseSearchParams(params: URLSearchParams): Partial<UrlState> {
  const state: Partial<UrlState> = {
    filters: {},
    sort: [],
    pagination: {},
  };

  // Filtros
  const status = params.get('status');
  if (status) {
    state.filters!.status = status.split(',') as any[];
  }

  const startDate = params.get('startDate');
  if (startDate) {
    state.filters!.startDate = startDate;
  }

  const endDate = params.get('endDate');
  if (endDate) {
    state.filters!.endDate = endDate;
  }

  const spaceIds = params.get('spaceIds');
  if (spaceIds) {
    state.filters!.spaceIds = spaceIds.split(',').map(Number);
  }

  const departmentIds = params.get('departmentIds');
  if (departmentIds) {
    state.filters!.departmentIds = departmentIds.split(',').map(Number);
  }

  const requiresTech = params.get('requiresTech');
  if (requiresTech !== null) {
    state.filters!.requiresTech = requiresTech === 'true';
  }

  const createdBy = params.get('createdBy');
  if (createdBy) {
    state.filters!.createdBy = createdBy;
  }

  // Paginación
  const page = params.get('page');
  if (page) {
    state.pagination!.page = parseInt(page, 10);
  }

  const pageSize = params.get('pageSize');
  if (pageSize) {
    const size = parseInt(pageSize, 10);
    if ([20, 50, 100].includes(size)) {
      state.pagination!.pageSize = size as 20 | 50 | 100;
    }
  }

  // Ordenamiento
  const sortBy = params.get('sortBy');
  const sortOrder = params.get('sortOrder');
  if (sortBy && sortOrder) {
    const fields = sortBy.split(',');
    const orders = sortOrder.split(',');
    
    state.sort = fields.map((field, index) => ({
      field: field as any,
      order: (orders[index] || 'asc') as 'asc' | 'desc',
    }));
  }

  // Calendario
  const calendarView = params.get('view');
  if (calendarView === 'month' || calendarView === 'week') {
    state.calendarView = calendarView;
  }

  const calendarDate = params.get('date');
  if (calendarDate) {
    state.calendarDate = calendarDate;
  }

  return state;
}

/**
 * Serializa estado del store a URLSearchParams
 */
export function serializeToSearchParams(state: Partial<UrlState>): URLSearchParams {
  const params = new URLSearchParams();

  // Filtros
  if (state.filters) {
    if (state.filters.status && state.filters.status.length > 0) {
      params.set('status', state.filters.status.join(','));
    }

    if (state.filters.startDate) {
      params.set('startDate', state.filters.startDate);
    }

    if (state.filters.endDate) {
      params.set('endDate', state.filters.endDate);
    }

    if (state.filters.spaceIds && state.filters.spaceIds.length > 0) {
      params.set('spaceIds', state.filters.spaceIds.join(','));
    }

    if (state.filters.departmentIds && state.filters.departmentIds.length > 0) {
      params.set('departmentIds', state.filters.departmentIds.join(','));
    }

    if (state.filters.requiresTech !== undefined) {
      params.set('requiresTech', String(state.filters.requiresTech));
    }

    if (state.filters.createdBy) {
      params.set('createdBy', state.filters.createdBy);
    }
  }

  // Paginación
  if (state.pagination) {
    if (state.pagination.page && state.pagination.page > 1) {
      params.set('page', String(state.pagination.page));
    }

    if (state.pagination.pageSize && state.pagination.pageSize !== 20) {
      params.set('pageSize', String(state.pagination.pageSize));
    }
  }

  // Ordenamiento
  if (state.sort && state.sort.length > 0) {
    const fields = state.sort.map(s => s.field).join(',');
    const orders = state.sort.map(s => s.order).join(',');
    params.set('sortBy', fields);
    params.set('sortOrder', orders);
  }

  // Calendario
  if (state.calendarView && state.calendarView !== 'month') {
    params.set('view', state.calendarView);
  }

  if (state.calendarDate) {
    params.set('date', state.calendarDate);
  }

  return params;
}

/**
 * Genera un hash único para un estado (útil para caché)
 */
export function generateStateHash(state: Partial<UrlState>): string {
  const params = serializeToSearchParams(state);
  return params.toString();
}
