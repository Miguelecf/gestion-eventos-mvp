/**
 * ===================================================================
 * COMPONENTE: SKELETON
 * ===================================================================
 * Componente de loading placeholder con animación de pulso.
 * ===================================================================
 */

import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}

export { Skeleton };
