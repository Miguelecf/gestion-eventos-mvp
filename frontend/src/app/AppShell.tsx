import { Outlet, NavLink } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const menu = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Calendario", to: "/calendar" },
  { label: "Listado", to: "/events" },
  { label: "Crear evento", to: "/events/new" },
  {
    group: "Catálogos", items: [
      { label: "Espacios", to: "/catalog/spaces" },
      { label: "Departamentos", to: "/catalog/departments" },
    ]
  },
  { group: "Admin", items: [{ label: "Usuarios & Roles", to: "/admin/users" }] },
];

export default function AppShell() {
  return (
    <div className="h-screen grid md:grid-cols-[260px_1fr] grid-cols-1">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex border-r flex-col">
        <Brand />
        <Nav />
      </aside>

      {/* Header + mobile sidebar */}
      <div className="flex flex-col">
        <header className="h-14 border-b flex items-center px-3 gap-2">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <Brand />
              <Nav />
            </SheetContent>
          </Sheet>
          <h1 className="font-semibold">Gestión de Eventos</h1>
        </header>
        <main className="flex-1 overflow-auto p-4 bg-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  );

  function Brand() {
    return (
      <div className="h-14 px-4 flex items-center gap-3">
        <img src="/unlalogo.jpg" className="h-8" alt="UNLa" />
        <span className="font-semibold">Gestión de Eventos</span>
      </div>
    );
  }
  function Nav() {
    return (
      <nav className="p-2 space-y-2">
        {menu.map((m, i) => m.group ? (
          <div key={i}>
            <div className="text-xs uppercase text-muted-foreground px-3 py-2">{m.group}</div>
            <div className="space-y-1">
              {m.items!.map(it => (
                <NavLink key={it.to} to={it.to}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm hover:bg-accent ${isActive ? "bg-accent" : ""}`}>
                  {it.label}
                </NavLink>
              ))}
            </div>
          </div>
        ) : (
          <NavLink key={m.to} to={m.to!}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm hover:bg-accent ${isActive ? "bg-accent" : ""}`}>
            {m.label}
          </NavLink>
        ))}
      </nav>
    )
  }
}
