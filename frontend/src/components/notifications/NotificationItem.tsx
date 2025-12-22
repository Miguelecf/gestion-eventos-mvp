/**
 * ===================================================================
 * NOTIFICATION ITEM COMPONENT
 * ===================================================================
 * Componente individual de notificación en el dropdown
 * ===================================================================
 */

import { Bell, MessageSquare, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Notification, NotificationType } from '@/models/notification';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

/**
 * Obtiene el icono según el tipo de notificación
 */
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'EVENT_STATUS_CHANGED':
      return <Bell className="h-4 w-4" />;
    case 'NEW_COMMENT_ON_EVENT':
      return <MessageSquare className="h-4 w-4" />;
    case 'PRIORITY_CONFLICT_DETECTED':
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
}

/**
 * Obtiene el color del badge según el tipo
 */
function getNotificationColor(type: NotificationType) {
  switch (type) {
    case 'EVENT_STATUS_CHANGED':
      return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950';
    case 'NEW_COMMENT_ON_EVENT':
      return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950';
    case 'PRIORITY_CONFLICT_DETECTED':
      return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950';
    default:
      return 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-950';
  }
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const handleClick = () => {
    onClick(notification);
  };
  
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: es
  });
  
  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full text-left px-4 py-3 transition-colors',
        'hover:bg-slate-50 dark:hover:bg-slate-800',
        'border-b border-slate-100 dark:border-slate-800',
        'focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-800',
        !notification.read && 'bg-blue-50/30 dark:bg-blue-950/10'
      )}
    >
      <div className="flex gap-3">
        {/* Icon badge */}
        <div
          className={cn(
            'flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full',
            getNotificationColor(notification.type)
          )}
        >
          {getNotificationIcon(notification.type)}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                'text-sm font-medium',
                notification.read
                  ? 'text-slate-700 dark:text-slate-300'
                  : 'text-slate-900 dark:text-slate-100'
              )}
            >
              {notification.title}
            </p>
            {!notification.read && (
              <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5" />
            )}
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
            {notification.body}
          </p>
          
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {timeAgo}
          </p>
        </div>
      </div>
    </button>
  );
}
