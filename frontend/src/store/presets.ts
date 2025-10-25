import type { EventFilters, SortConfig, PaginationState } from '@/models/event';

export interface PresetConfig {
  filters: Partial<EventFilters>;
  sort: SortConfig[];
  pagination: Omit<PaginationState, 'total' | 'totalPages'>;
}

export const PRESETS = {
  default: {
    filters: {},
    sort: [
      { field: 'date', order: 'asc' },
      { field: 'scheduleFrom', order: 'asc' },
      { field: 'priority', order: 'desc' },
    ],
    pagination: { page: 1, pageSize: 20 },
  },
  
  myEvents: {
    filters: {}, // createdBy se añade dinámicamente
    sort: [{ field: 'createdOn', order: 'desc' }],
    pagination: { page: 1, pageSize: 20 },
  },
  
  technical: {
    filters: { requiresTech: true },
    sort: [
      { field: 'date', order: 'asc' },
      { field: 'scheduleFrom', order: 'asc' },
    ],
    pagination: { page: 1, pageSize: 50 },
  },
} as const satisfies Record<string, PresetConfig>;

export type PresetName = keyof typeof PRESETS;

export function getDefaultPresetForRole(roles: string[]): PresetName {
  if (roles.includes('ROLE_ADMIN_TECNICA')) return 'technical';
  return 'default';
}

export function getPresetConfig(preset: PresetName, userId?: string): PresetConfig {
  const config = { ...PRESETS[preset] };
  
  // Si es "myEvents", añadir filtro de createdBy
  if (preset === 'myEvents' && userId) {
    config.filters = { ...config.filters, createdBy: userId };
  }
  
  return config;
}
