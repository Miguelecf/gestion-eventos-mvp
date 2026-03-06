/**
 * ===================================================================
 * COMPONENTE: EventConformityCheck
 * ===================================================================
 * Muestra el estado de conformidad (Ceremonial/Técnica) de un evento
 * con iconos visuales y colores según el estado.
 * ===================================================================
 */

import { Check, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventConformityCheckProps {
  label: string;
  status: boolean;
  showOnlyIfRequired?: boolean;
}

export function EventConformityCheck({
  label,
  status,
  showOnlyIfRequired = false,
}: EventConformityCheckProps) {
  // No mostrar si es opcional y no está definido
  if (showOnlyIfRequired && !status) {
    return null;
  }

  const getIcon = () => {
    if (status === true) return <Check className="h-4 w-4" />;
    if (status === false) return <X className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const getColor = () => {
    if (status === true) return 'text-emerald-600';
    if (status === false) return 'text-red-600';
    return 'text-slate-400';
  };

  return (
    <div className={cn('flex items-center gap-1 text-sm', getColor())}>
      {getIcon()}
      <span>{label}</span>
    </div>
  );
}
