import { useAuth } from '@/features/auth/AuthProvider';

/**
 * Hook para manejar permisos basados en roles.
 * Los roles del backend son: ADMIN_FULL, ADMIN_CEREMONIAL, ADMIN_TECNICA, USUARIO
 */
export function useRole() {
  const { user } = useAuth();

  /**
   * Verifica si el usuario tiene un rol específico o uno de varios roles
   * @param role - Un rol o array de roles a verificar
   */
  const hasRole = (role: string | string[]) => {
    if (!user?.role) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };

  /**
   * Verifica si el usuario es cualquier tipo de administrador
   */
  const isAdmin = () => {
    return hasRole(['ADMIN_FULL', 'ADMIN_CEREMONIAL', 'ADMIN_TECNICA']);
  };

  /**
   * Verifica si el usuario es Administrador General (acceso completo)
   */
  const isAdminFull = () => hasRole('ADMIN_FULL');

  /**
   * Verifica si el usuario es Administrador Ceremonial
   */
  const isAdminCeremonial = () => hasRole('ADMIN_CEREMONIAL');

  /**
   * Verifica si el usuario es Administrador Técnica
   */
  const isAdminTecnica = () => hasRole('ADMIN_TECNICA');

  /**
   * Verifica si el usuario es un usuario regular (sin privilegios de admin)
   */
  const isUsuario = () => hasRole('USUARIO');

  /**
   * Verifica si el usuario puede gestionar catálogos (Espacios, Departamentos)
   */
  const canManageCatalogs = () => {
    return hasRole(['ADMIN_FULL', 'ADMIN_CEREMONIAL', 'ADMIN_TECNICA']);
  };

  /**
   * Verifica si el usuario puede aprobar eventos ceremoniales
   */
  const canApproveCeremonial = () => {
    return hasRole(['ADMIN_FULL', 'ADMIN_CEREMONIAL']);
  };

  /**
   * Verifica si el usuario puede aprobar eventos técnicos
   */
  const canApproveTechnical = () => {
    return hasRole(['ADMIN_FULL', 'ADMIN_TECNICA']);
  };

  /**
   * Verifica si el usuario puede ver eventos
   */
  const canReadEvents = () => {
    return hasRole(['ADMIN_FULL', 'ADMIN_CEREMONIAL', 'ADMIN_TECNICA', 'USUARIO']);
  };

  /**
   * Verifica si el usuario puede crear eventos
   */
  const canCreateEvents = () => {
    return hasRole(['ADMIN_FULL', 'ADMIN_CEREMONIAL', 'ADMIN_TECNICA', 'USUARIO']);
  };

  /**
   * Verifica si el usuario puede editar un evento
   * @param eventCreatedBy - ID del creador del evento
   */
  const canEditEvent = (eventCreatedBy?: number | string) => {
    if (isAdmin()) return true;
    if (isUsuario() && eventCreatedBy) {
      return user?.id?.toString() === eventCreatedBy?.toString();
    }
    return false;
  };

  /**
   * Verifica si el usuario puede eliminar un evento
   * @param eventCreatedBy - ID del creador del evento
   */
  const canDeleteEvent = (eventCreatedBy?: number | string) => {
    if (isAdmin()) return true;
    if (isUsuario() && eventCreatedBy) {
      return user?.id?.toString() === eventCreatedBy?.toString();
    }
    return false;
  };

  return {
    role: user?.role,
    userId: user?.id,
    hasRole,
    isAdmin,
    isAdminFull,
    isAdminCeremonial,
    isAdminTecnica,
    isUsuario,
    canManageCatalogs,
    canApproveCeremonial,
    canApproveTechnical,
    canReadEvents,
    canCreateEvents,
    canEditEvent,
    canDeleteEvent,
  };
}
