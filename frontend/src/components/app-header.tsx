import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  Menu,
  Moon,
  Search,
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
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AppSidebar from "@/components/app-sidebar";
import { AppBreadcrumbs } from "@/components/breadcrumbs";
import LogoutButton from "@/features/auth/components/LogoutButton";

export default function AppHeader() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const next = !isDark;
    root.classList.toggle("dark", next);
    setIsDark(next);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border border-slate-200 bg-white/70"
                aria-label="Abrir menú de navegación"
              >
                <Menu className="h-5 w-5 text-slate-600" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <AppSidebar variant="drawer" className="h-full" />
            </SheetContent>
          </Sheet>

          <AppBreadcrumbs />
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="relative hidden w-full max-w-sm md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Buscar en el panel..."
              className="w-full rounded-full border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-600 placeholder:text-slate-400"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="hidden rounded-full border border-slate-200 bg-white/80 transition hover:bg-slate-100 md:inline-flex"
            onClick={toggleTheme}
            aria-label="Alternar modo de color"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-slate-600" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full border border-slate-200 bg-white/80 transition hover:bg-slate-100"
            aria-label="Ver notificaciones"
          >
            <Bell className="h-5 w-5 text-slate-600" />
            <Badge
              variant="default"
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full px-0 text-[10px]"
            >
              3
            </Badge>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 rounded-full border border-transparent bg-white/0 px-2 py-1 text-left transition hover:border-slate-200">
                <Avatar className="h-9 w-9 border border-slate-200">
                  <AvatarFallback>UN</AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-semibold text-slate-900">
                    Usuario UNLa
                  </p>
                  <p className="text-xs text-slate-500">Administrador</p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-slate-400 lg:block" />
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
                <LogoutButton />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
