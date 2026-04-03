import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, FileText, Search, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PublicAccessPanelProps = {
  variant: "desktop" | "mobile";
  className?: string;
};

export default function PublicAccessPanel({
  variant,
  className,
}: PublicAccessPanelProps) {
  const [showTrackingInfo, setShowTrackingInfo] = useState(false);
  const trackingHintId = useId();
  const isDesktop = variant === "desktop";

  const handleToggleTrackingInfo = () => {
    setShowTrackingInfo((current) => !current);
  };

  if (isDesktop) {
    return (
      <div className={cn("relative z-10 flex h-full flex-col gap-8", className)}>
        <div className="flex flex-1 items-center">
          <div className="w-full space-y-8">
            <div className="max-w-xl space-y-4">
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur">
                SOLICITUD PÚBLICA
              </span>
              <h1 className="max-w-lg text-4xl font-semibold leading-tight xl:text-5xl">
                Solicitá y seguí tu evento desde un solo lugar
              </h1>
            </div>

            <div className="max-w-xl rounded-[1.75rem] border border-white/15 bg-white/10 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.22)] backdrop-blur-xl">
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/60">
                    SOLICITUD PÚBLICA
                  </p>
                  <h3 className="text-3xl font-semibold">Solicitá tu evento</h3>
                  <p className="max-w-lg text-base leading-7 text-white/80">
                    Completá el formulario público si no tenés usuario y seguí el
                    estado de tu solicitud.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-xl bg-white px-6 text-[#6f1717] shadow-lg shadow-black/10 hover:bg-white/90"
                  >
                    <Link to="/solicitud">
                      Solicitar evento
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    onClick={handleToggleTrackingInfo}
                    aria-expanded={showTrackingInfo}
                    aria-controls={trackingHintId}
                    className="h-12 rounded-xl border border-white/20 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"
                  >
                    Seguir solicitud
                  </Button>
                </div>

                <div
                  id={trackingHintId}
                  className={cn(
                    "overflow-hidden transition-[max-height,opacity] duration-300",
                    showTrackingInfo ? "max-h-40 opacity-100" : "max-h-0 opacity-0",
                  )}
                  aria-hidden={!showTrackingInfo}
                >
                  <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-black/10 px-4 py-3 text-sm text-white/85">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-white/80" />
                    <p>
                      El seguimiento se realiza con el código que recibís al
                      finalizar la solicitud.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <UserRound className="h-5 w-5 text-white/75" />
            <p className="mt-4 text-sm text-white/65">Acceso</p>
            <p className="mt-1 text-lg font-semibold">Sin usuario</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <FileText className="h-5 w-5 text-white/75" />
            <p className="mt-4 text-sm text-white/65">Formulario</p>
            <p className="mt-1 text-lg font-semibold">Solicitud pública</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <Search className="h-5 w-5 text-white/75" />
            <p className="mt-4 text-sm text-white/65">Seguimiento</p>
            <p className="mt-1 text-lg font-semibold">Con código</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-[#6f1717]/10 bg-gradient-to-br from-[#f7eded] via-white to-slate-50 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.10)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(111,23,23,0.24),rgba(15,23,42,0.96))] dark:shadow-[0_20px_60px_rgba(2,6,23,0.35)]",
        className,
      )}
    >
      <div className="space-y-4">
        <span className="inline-flex rounded-full border border-[#6f1717]/10 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#6f1717] dark:border-white/15 dark:bg-white/10 dark:text-white/80">
          SOLICITUD PÚBLICA
        </span>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Solicitá tu evento
          </h2>
          <p className="text-sm leading-6 text-slate-600 dark:text-white/75">
            Completá el formulario público si no tenés usuario y seguí el
            estado de tu solicitud.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            asChild
            className="h-11 rounded-xl bg-[#6f1717] text-white shadow-lg shadow-[#6f1717]/20 hover:bg-[#5b1111] dark:bg-white dark:text-[#6f1717] dark:hover:bg-white/90"
          >
            <Link to="/solicitud">
              Solicitar evento
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleToggleTrackingInfo}
            aria-expanded={showTrackingInfo}
            aria-controls={trackingHintId}
            className="h-11 rounded-xl border-[#6f1717]/15 bg-white/80 text-[#6f1717] hover:bg-[#f7eded] dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
          >
            Seguir solicitud
          </Button>
        </div>

        <div
          id={trackingHintId}
          className={cn(
            "overflow-hidden transition-[max-height,opacity] duration-300",
            showTrackingInfo ? "max-h-32 opacity-100" : "max-h-0 opacity-0",
          )}
          aria-hidden={!showTrackingInfo}
        >
          <div className="flex items-start gap-3 rounded-2xl border border-[#6f1717]/10 bg-white/80 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-white/80">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#6f1717] dark:text-white/75" />
            <p>
              El seguimiento se realiza con el código que recibís al finalizar
              la solicitud.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
