/**
 * ===================================================================
 * COMPONENTE: AlertCard
 * ===================================================================
 * Tarjeta individual de alerta con estilo según severidad
 * ===================================================================
 */

import type { DashboardAlert } from '../hooks/useDashboardAlerts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, Info, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Props {
  alert: DashboardAlert;
}

export function AlertCard({ alert }: Props) {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (alert.severity) {
      case 'high':
        return <AlertCircle className="h-5 w-5" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5" />;
      case 'low':
        return <Info className="h-5 w-5" />;
    }
  };

  const getColorClasses = () => {
    switch (alert.severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getBadgeClasses = () => {
    switch (alert.severity) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  const getButtonClasses = () => {
    switch (alert.severity) {
      case 'high':
        return 'border-red-300 hover:bg-red-100 text-red-700';
      case 'medium':
        return 'border-amber-300 hover:bg-amber-100 text-amber-700';
      case 'low':
        return 'border-blue-300 hover:bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className={cn('rounded-lg border p-4', getColorClasses())}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold">{alert.title}</h3>
              <Badge className={cn('text-xs', getBadgeClasses())}>
                {alert.count}
              </Badge>
            </div>
            <p className="text-xs opacity-90">{alert.description}</p>
          </div>
        </div>
      </div>

      {/* Lista de items (máximo 3) */}
      {alert.items.length > 0 && (
        <div className="mt-3 space-y-1.5 mb-3">
          {alert.items.map((item) => (
            <div
              key={item.id}
              className="text-xs pl-8 opacity-80 flex items-start gap-2"
            >
              <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-medium">{item.name}</span>
                {item.details && (
                  <span className="opacity-75"> · {item.details}</span>
                )}
              </div>
            </div>
          ))}

          {/* Indicador de "más items" */}
          {alert.count > 3 && (
            <div className="text-xs pl-8 opacity-60 italic">
              + {alert.count - 3} más
            </div>
          )}
        </div>
      )}

      {/* Botón de acción */}
      <div className="flex justify-end mt-3 pt-3 border-t border-current/10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(alert.actionHref)}
          className={cn('text-xs h-8', getButtonClasses())}
        >
          {alert.actionLabel}
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}
