import { Outlet } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { PublicAccessPanel } from "@/features/public/components";
import logo from "@/assets/unla-logo.svg";

export function AuthLayout() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(128,0,0,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(30,41,59,0.16),_transparent_36%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(153,27,27,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(148,163,184,0.10),_transparent_34%)]" />
      <div className="absolute left-10 top-10 h-56 w-56 rounded-full bg-rose-200/60 blur-3xl dark:bg-rose-900/20" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-slate-300/40 blur-3xl dark:bg-slate-700/20" />

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <section className="flex flex-1 flex-col px-6 py-6 sm:px-10 lg:min-h-screen lg:w-1/2 lg:px-16 xl:px-24">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex cursor-default select-none items-center gap-3 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
              <img
                src={logo}
                alt="Universidad Nacional de Lanus"
                className="h-9 w-9 rounded-md object-contain"
              />
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Gestion de Eventos
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Universidad Nacional de Lanus
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-slate-200/80 bg-white/80 backdrop-blur hover:bg-white dark:border-slate-800 dark:bg-slate-900/80 dark:hover:bg-slate-900"
              onClick={toggleTheme}
              aria-label="Alternar modo de color"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              )}
            </Button>
          </div>

          <div className="flex flex-1 items-center justify-center py-10 lg:py-16">
            <Outlet />
          </div>
        </section>

        <aside className="relative hidden lg:flex lg:w-1/2">
          <div className="m-6 flex flex-1 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#4a0d0d] via-[#6f1717] to-[#111827] p-10 text-white shadow-2xl">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.10),transparent_34%)]" />
            <PublicAccessPanel variant="desktop" />
          </div>
        </aside>
      </div>
    </div>
  );
}
