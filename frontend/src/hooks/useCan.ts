import { useAppStore } from '@/store';
import type { Action, Subject } from '@/libs/ability';

export function useCan() {
  const ability = useAppStore(state => state.ability);
  
  return (
    action: Action, 
    subject: Subject
  ): boolean => {
    if (!ability) return false;
    // Para simplificar, ignoramos las condiciones en el check básico
    // La validación de ownership se hace en useCanAccessEvent
    return ability.can(action, subject);
  };
}

// Hook adicional para verificar ownership de eventos
export function useCanAccessEvent(event: { createdBy?: string }) {
  const can = useCan();
  const userId = useAppStore(state => state.userId);
  
  // Verificar permisos básicos + ownership manual
  const hasUpdatePermission = can('update', 'Event');
  const hasDeletePermission = can('delete', 'Event');
  const canChangeState = can('changeState', 'Event');
  const canApprove = can('approveCeremonial', 'Event') || can('approveTechnical', 'Event');
  
  // Para ROLE_USUARIO: debe ser el creador
  const isOwner = event.createdBy === userId;
  const roles = useAppStore(state => state.roles);
  const isUserRole = roles.includes('ROLE_USUARIO');
  
  return {
    canUpdate: hasUpdatePermission && (!isUserRole || isOwner),
    canDelete: hasDeletePermission && (!isUserRole || isOwner),
    canChangeState,
    canApprove,
    isOwner,
  };
}

