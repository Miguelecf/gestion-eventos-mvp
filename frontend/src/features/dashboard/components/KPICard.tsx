/**
 * ===================================================================
 * COMPONENT: KPICard (Genérico)
 * ===================================================================
 * Card reutilizable para mostrar indicadores KPI en el dashboard.
 * Proporciona un layout consistente con ícono, título y contenido.
 * ===================================================================
 */

import type { LucideIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KPICardProps {
  /** Título del KPI */
  title: string;
  
  /** Descripción opcional del KPI */
  description?: string;
  
  /** Ícono de lucide-react */
  icon: LucideIcon;
  
  /** Color del ícono (clase Tailwind) */
  iconColor?: string;
  
  /** Contenido del KPI */
  children: React.ReactNode;
  
  /** Clases adicionales para el Card */
  className?: string;
}

/**
 * Card genérica para mostrar un KPI
 * 
 * @example
 * ```tsx
 * <KPICard
 *   title="Eventos hoy"
 *   description="Total programados"
 *   icon={Calendar}
 *   iconColor="text-blue-600"
 * >
 *   <span className="text-3xl font-semibold">12</span>
 * </KPICard>
 * ```
 */
export function KPICard({
  title,
  description,
  icon: Icon,
  iconColor = 'text-slate-600',
  children,
  className,
}: KPICardProps) {
  return (
    <Card
      className={cn(
        'rounded-2xl border-slate-200 shadow-sm transition hover:shadow-md',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base text-slate-700">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-xs">
              {description}
            </CardDescription>
          )}
        </div>
        <span
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full bg-slate-100',
            iconColor
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
