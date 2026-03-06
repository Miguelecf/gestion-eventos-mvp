/**
 * ===================================================================
 * COMPONENTE: EventTimelineBadge
 * ===================================================================
 * Muestra el rango horario de un evento en formato compacto.
 * ===================================================================
 */

import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventTimelineBadgeProps {
  from: string;
  to: string;
  className?: string;
}

export function EventTimelineBadge({
  from,
  to,
  className,
}: EventTimelineBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700',
        className
      )}
    >
      <Clock className="h-3 w-3" />
      <span>
        {from} - {to}
      </span>
    </div>
  );
}
