import { TodayAgenda } from "../components/TodayAgenda";
import { AlertsPanel } from "../components/AlertsPanel";
import { KPIsGrid } from "../components/KPIsGrid";
import { QuickActions } from "../components/QuickActions";

export function DashboardPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <p className="text-sm font-medium text-slate-500">
          Tablero principal
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Bienvenido al panel de eventos
        </h1>
      </header>

      {/* Fase 3: Indicadores KPIs con datos reales */}
      <KPIsGrid />

      {/* NUEVO: Panel de Alertas Operativas (Fase 2) */}
      <AlertsPanel />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Agenda del Día con filtros (Fase 1 + Fase 4) */}
        <TodayAgenda />

        {/* Accesos rápidos (Fase 4) */}
        <QuickActions />
      </section>
    </div>
  );
}

