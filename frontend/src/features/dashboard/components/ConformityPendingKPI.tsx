/**
 * ===================================================================
 * COMPONENT: ConformityPendingKPI
 * ===================================================================
 * KPI que muestra eventos pendientes de conformidad (OK) de
 * Ceremonial y Técnica.
 * ===================================================================
 */

import { CheckCircle2 } from 'lucide-react';
import { KPICard } from './KPICard';
import { cn } from '@/lib/utils';

interface ConformityPendingKPIProps {
  /** Pendientes de conformidad */
  pending: {
    /** Eventos sin OK de Ceremonial */
    ceremonial: number;
    /** Eventos sin OK de Técnica */
    technical: number;
  };
}

/**
 * KPI: Pendientes de conformidad
 * 
 * @example
 * ```tsx
 * <ConformityPendingKPI 
 *   pending={{ ceremonial: 2, technical: 1 }}
 * />
 * ```
 */
export function ConformityPendingKPI({ pending }: ConformityPendingKPIProps) {
  const total = pending.ceremonial + pending.technical;
  const hasIssues = total > 0;

  return (
    <KPICard
      title="Pendientes de OK"
      description="Conformidades requeridas"
      icon={CheckCircle2}
      iconColor={hasIssues ? 'text-amber-600' : 'text-green-600'}
      className={hasIssues ? 'border-amber-200 bg-amber-50/30' : ''}
    >
      <div className="space-y-2">
        {/* Total principal */}
        <div className="flex items-end justify-between">
          <span
            className={cn(
              'text-3xl font-semibold',
              hasIssues ? 'text-amber-700' : 'text-green-700'
            )}
          >
            {total}
          </span>
          {!hasIssues && (
            <span className="text-sm font-medium text-green-600">
              ✓ Todo OK
            </span>
          )}
        </div>

        {/* Desglose Ceremonial / Técnica */}
        <div className="flex flex-col gap-1 text-sm text-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Ceremonial:</span>
            <span
              className={cn(
                'font-medium',
                pending.ceremonial > 0 ? 'text-amber-700' : 'text-green-600'
              )}
            >
              {pending.ceremonial > 0 ? (
                `${pending.ceremonial} pendiente${pending.ceremonial > 1 ? 's' : ''}`
              ) : (
                '✓'
              )}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Técnica:</span>
            <span
              className={cn(
                'font-medium',
                pending.technical > 0 ? 'text-amber-700' : 'text-green-600'
              )}
            >
              {pending.technical > 0 ? (
                `${pending.technical} pendiente${pending.technical > 1 ? 's' : ''}`
              ) : (
                '✓'
              )}
            </span>
          </div>
        </div>
      </div>
    </KPICard>
  );
}
