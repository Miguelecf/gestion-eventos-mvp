import {
  Bell,
  ChevronDown,
  Menu,
  Moon,
  Sun,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AppSidebar from "@/components/app-sidebar";
import { AppBreadcrumbs } from "@/components/breadcrumbs";
import { useTheme } from "@/contexts/ThemeContext";

export default function AppHeader() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-800/70"
                aria-label="Abrir menú de navegación"
              >
                <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <AppSidebar variant="drawer" className="h-full" />
            </SheetContent>
          </Sheet>

          <AppBreadcrumbs />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="hidden rounded-full border border-slate-200 bg-white/80 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-700 md:inline-flex"
            onClick={toggleTheme}
            aria-label="Alternar modo de color"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full border border-slate-200 bg-white/80 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-700"
            aria-label="Ver notificaciones"
          >
            <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            <Badge
              variant="default"
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full px-0 text-[10px]"
            >
              3
            </Badge>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 rounded-full border border-transparent bg-white/0 px-2 py-1 text-left transition hover:border-slate-200 dark:hover:border-slate-700">
                <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
                  <AvatarFallback>UN</AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Usuario UNLa
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Administrador</p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-slate-400 dark:text-slate-500 lg:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild>
                <a href="#">Mi perfil</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button type="button">Preferencias</button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button type="button">Cerrar sesión</button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
