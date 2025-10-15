import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const highlights: Array<{
  label: string;
  description: string;
  value: string;
  trend: string;
  icon: LucideIcon;
}> = [
  {
    label: "Eventos confirmados",
    description: "Últimos 30 días",
    value: "24",
    trend: "+12%",
    icon: CheckCircle2,
  },
  {
    label: "Solicitudes pendientes",
    description: "Revisar prioridad alta",
    value: "8",
    trend: "−3",
    icon: Clock3,
  },
  {
    label: "Reservas de espacios",
    description: "Esta semana",
    value: "17",
    trend: "+5%",
    icon: CalendarCheck,
  },
  {
    label: "Usuarios activos",
    description: "Organizadores y asistentes",
    value: "126",
    trend: "+9",
    icon: Users,
  },
];

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

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {highlights.map((item) => (
          <Card
            key={item.label}
            className="rounded-2xl border-slate-200 shadow-sm transition hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base text-slate-700">
                  {item.label}
                </CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <item.icon className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <span className="text-3xl font-semibold text-slate-900">
                {item.value}
              </span>
              <span className="text-sm font-medium text-emerald-600">
                {item.trend}
              </span>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">
              Próximos eventos
            </CardTitle>
            <CardDescription>
              Los eventos confirmados para los próximos 7 días.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: "Jornada de puertas abiertas",
                date: "Mié 12 Jun · 10:00 hs",
                location: "Aula Magna",
              },
              {
                title: "Capacitación docente",
                date: "Jue 13 Jun · 09:30 hs",
                location: "Sala 3 · Centro de capacitación",
              },
              {
                title: "Seminario de innovación",
                date: "Vie 14 Jun · 14:00 hs",
                location: "Auditorio principal",
              },
            ].map((event) => (
              <article
                key={event.title}
                className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
              >
                <h3 className="text-base font-semibold text-slate-800">
                  {event.title}
                </h3>
                <p className="text-sm text-slate-500">{event.date}</p>
                <p className="text-sm text-slate-400">{event.location}</p>
              </article>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">
              Recordatorios
            </CardTitle>
            <CardDescription>
              Acciones rápidas para mantener el flujo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Revisar solicitudes pendientes",
              "Confirmar logística con Protocolo",
              "Enviar encuestas a asistentes",
              "Actualizar catálogo de espacios",
            ].map((task) => (
              <div
                key={task}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
              >
                {task}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

