import { useMemo } from 'react';
import { useAppStore } from '@/store';
import { useCan } from '@/hooks/useCan';
import type { Event } from '@/models/event';
import type { Comment } from '@/services/api/adapters/comment.adapter';

const OPERATIVE_ROLES = ['ROLE_ADMIN_FULL', 'ROLE_ADMIN_CEREMONIAL', 'ROLE_ADMIN_TECNICA'] as const;

export function useEventPermissions(event: Event | null) {
  const can = useCan();
  const roles = useAppStore((state) => state.roles);
  const userId = useAppStore((state) => state.userId);

  return useMemo(() => {
    const isOperativeRole = roles.some((role) => OPERATIVE_ROLES.includes(role as typeof OPERATIVE_ROLES[number]));
    const isOwner = Boolean(event?.createdBy?.id != null && String(event.createdBy.id) === userId);
    const isUserRole = roles.includes('ROLE_USUARIO');

    const canReadPublicRequest = can('read', 'PublicRequest');
    const canUpdateEvent = can('update', 'Event') && (!isUserRole || isOwner);
    const canDeleteEvent = can('delete', 'Event') && (!isUserRole || isOwner);
    const canManageStatus = can('changeState', 'Event');
    const canApprove =
      can('approveCeremonial', 'Event') || can('approveTechnical', 'Event');

    const canViewAudit = isOperativeRole && can('audit:view', 'AuditLog');
    const canViewComments = isOperativeRole;
    const canCreateComment = isOperativeRole;
    const canEditAnyComment = isOperativeRole;
    const canDeleteAnyComment = isOperativeRole;

    const canManageComment = (comment: Comment | null | undefined) => {
      if (!comment || !canViewComments) {
        return false;
      }

      const isOwnComment = String(comment.author.id) === userId;
      return isOwnComment || canDeleteAnyComment;
    };

    return {
      isOperativeRole,
      isOwner,
      canReadPublicRequest,
      canUpdateEvent,
      canDeleteEvent,
      canManageStatus,
      canApprove,
      canViewAudit,
      canViewComments,
      canCreateComment,
      canEditAnyComment,
      canDeleteAnyComment,
      canManageComment,
    };
  }, [can, event?.createdBy?.id, roles, userId]);
}
