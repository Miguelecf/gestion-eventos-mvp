export const USER_ROLES = ['ADMIN_FULL', 'ADMIN_CEREMONIAL', 'ADMIN_TECNICA', 'USUARIO'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type UserPriority = (typeof USER_PRIORITIES)[number];

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  name: string;
  lastName: string;
  priority: UserPriority;
  role: UserRole;
  active: boolean;
  mustChangePassword: boolean;
  failedLoginAttempts: number;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserRoleOption {
  value: UserRole;
  label: string;
}

export interface UserFilters {
  q?: string;
  role?: UserRole;
  active?: boolean;
  page?: number;
  size?: number;
}

export interface CreateAdminUserInput {
  username: string;
  email: string;
  name: string;
  lastName: string;
  role: UserRole;
  priority: UserPriority;
  active: boolean;
}

export interface UpdateAdminUserInput {
  username?: string;
  email?: string;
  name?: string;
  lastName?: string;
  priority?: UserPriority;
}
