/**
 * ===================================================================
 * COMPONENT: QuickActionButton
 * ===================================================================
 * Botón reutilizable para acciones rápidas de navegación.
 * ===================================================================
 */

import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface QuickActionButtonProps {
  /** Ícono de lucide-react */
  icon: LucideIcon;
  
  /** Texto principal del botón */
  label: string;
  
  /** Descripción breve */
  description: string;
  
  /** Ruta de destino */
  href: string;
  
  /** Variante visual del botón */
  variant?: 'primary' | 'secondary' | 'accent';
}

/**
 * Botón de acción rápida
 * 
 * @example
 * ```tsx
 * <QuickActionButton
 *   icon={List}
 *   label="Ver todos los eventos"
 *   description="Listado completo con búsqueda"
 *   href="/eventos"
 *   variant="primary"
 * />
 * ```
 */
export function QuickActionButton({
  icon: Icon,
  label,
  description,
  href,
  variant = 'secondary',
}: QuickActionButtonProps) {
  const navigate = useNavigate();

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300';
      case 'accent':
        return 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300';
      case 'secondary':
      default:
        return 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return 'text-blue-600';
      case 'accent':
        return 'text-emerald-600';
      case 'secondary':
      default:
        return 'text-slate-600';
    }
  };

  return (
    <button
      onClick={() => navigate(href)}
      className={cn(
        'w-full rounded-lg border p-4 text-left transition-all',
        getVariantClasses()
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-white', getIconColor())}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 mb-0.5">
            {label}
          </h4>
          <p className="text-sm text-slate-600">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}
