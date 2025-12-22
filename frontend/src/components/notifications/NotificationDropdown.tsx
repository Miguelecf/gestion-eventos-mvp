/**
 * ===================================================================
 * NOTIFICATION DROPDOWN COMPONENT
 * ===================================================================
 * Dropdown con lista de notificaciones y acción "marcar todas leídas"
 * ===================================================================
 */

import { useNavigate } from 'react-router-dom';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationsStore } from '@/store/notifications.store';
import { NotificationItem } from './NotificationItem';
import type { Notification } from '@/models/notification';

export function NotificationDropdown() {
  const navigate = useNavigate();
  
  const {
    notifications,
    unreadCount,
    loading,
    initialized,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  } = useNotificationsStore();
  
  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como leída
    await markAsRead(notification.id);
    
    // Navegar si tiene actionUrl
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };
  
  const handleOpenChange = (open: boolean) => {
    // Cuando se abre el dropdown, fetch on-demand de notificaciones
    if (open && !initialized) {
      fetchNotifications({ page: 0, size: 20 });
    }
  };
  
  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full border border-slate-200 bg-white transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
          aria-label="Ver notificaciones"
        >
          <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          {unreadCount > 0 && (
            <Badge
              variant="default"
              className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-semibold"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent
        align="end"
        className="w-[380px] p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Notificaciones
          </h3>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={loading.markAllAsRead}
              className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950"
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar todas leídas
            </Button>
          )}
        </div>
        
        {/* List */}
        <ScrollArea className="h-[400px]">
          {loading.notifications && !initialized ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Cargando notificaciones...
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Bell className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No tienes notificaciones
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-center">
                Aquí aparecerán las actualizaciones de tus eventos
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={handleNotificationClick}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
