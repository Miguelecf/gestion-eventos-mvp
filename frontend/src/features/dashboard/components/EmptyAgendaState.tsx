/**
 * ===================================================================
 * COMPONENTE: EmptyAgendaState
 * ===================================================================
 * Estado vacío cuando no hay eventos programados para el día.
 * ===================================================================
 */

import { CalendarX2 } from 'lucide-react';

export function EmptyAgendaState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
        <CalendarX2 className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">
        No hay eventos progamados para hoy
      </h3>
      <p className="text-sm text-slate-500 max-w-sm">
        No se encontraron eventos programados para el día de hoy. Los eventos aparecerán aquí cuando sean creados.
      </p>
    </div>
  );
}
