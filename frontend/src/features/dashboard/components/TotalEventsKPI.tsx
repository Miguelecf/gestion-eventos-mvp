/**
 * ===================================================================
 * COMPONENT: TotalEventsKPI
 * ===================================================================
 * KPI que muestra el total de eventos programados para hoy.
 * ===================================================================
 */

import { Calendar } from 'lucide-react';
import { KPICard } from './KPICard';

interface TotalEventsKPIProps {
  /** Cantidad total de eventos */
  count: number;
}

/**
 * KPI: Total de eventos hoy
 * 
 * @example
 * ```tsx
 * <TotalEventsKPI count={12} />
 * ```
 */
export function TotalEventsKPI({ count }: TotalEventsKPIProps) {
  return (
    <KPICard
      title="Eventos hoy"
      description="Total programados"
      icon={Calendar}
      iconColor="text-blue-600"
    >
      <div className="flex items-end justify-between">
        <span className="text-3xl font-semibold text-slate-900">
          {count}
        </span>
        {/* Opcional: Trend comparado con ayer (futuro enhancement) */}
        {/* <span className="text-sm font-medium text-emerald-600">
          +2 vs ayer
        </span> */}
      </div>
    </KPICard>
  );
}
