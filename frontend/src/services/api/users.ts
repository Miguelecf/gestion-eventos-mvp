import api from '@/lib/http';
import type { SpringPageResponse } from './types/pagination.types';
import type {
  AdminUser,
  CreateAdminUserInput,
  UpdateAdminUserInput,
  UserFilters,
  UserRole,
  UserRoleOption,
} from '@/models/user-admin';

const USERS_BASE_PATH = '/api/users';

function buildUsersQuery(filters: UserFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.q && filters.q.trim().length > 0) {
    params.set('q', filters.q.trim());
  }
  if (filters.role) {
    params.set('role', filters.role);
  }
  if (filters.active !== undefined) {
    params.set('active', String(filters.active));
  }
  if (filters.page !== undefined) {
    params.set('page', String(filters.page));
  }
  if (filters.size !== undefined) {
    params.set('size', String(filters.size));
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

export const usersApi = {
  list(filters: UserFilters = {}) {
    const query = buildUsersQuery(filters);
    return api.get<SpringPageResponse<AdminUser>>(`${USERS_BASE_PATH}${query}`).then((r) => r.data);
  },

  getById(id: number) {
    return api.get<AdminUser>(`${USERS_BASE_PATH}/${id}`).then((r) => r.data);
  },

  create(payload: CreateAdminUserInput) {
    return api.post<AdminUser>(USERS_BASE_PATH, payload).then((r) => r.data);
  },

  update(id: number, payload: UpdateAdminUserInput) {
    return api.patch<AdminUser>(`${USERS_BASE_PATH}/${id}`, payload).then((r) => r.data);
  },

  updateRole(id: number, role: UserRole) {
    return api.patch<AdminUser>(`${USERS_BASE_PATH}/${id}/role`, { role }).then((r) => r.data);
  },

  updateStatus(id: number, active: boolean) {
    return api.patch<AdminUser>(`${USERS_BASE_PATH}/${id}/status`, { active }).then((r) => r.data);
  },

  resetPassword(id: number) {
    return api.post<AdminUser>(`${USERS_BASE_PATH}/${id}/reset-password`).then((r) => r.data);
  },

  listRoles() {
    return api.get<UserRoleOption[]>(`${USERS_BASE_PATH}/roles`).then((r) => r.data);
  },
};
