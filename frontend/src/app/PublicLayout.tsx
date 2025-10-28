import { Outlet } from 'react-router-dom';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <img src="/unlalogo.jpg" alt="UNLA" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="text-xl font-bold">Universidad Nacional</h1>
              <p className="text-sm text-muted-foreground">Gestión de Eventos</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <Outlet />
      </main>
      
      <footer className="border-t mt-auto bg-card">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Universidad Nacional de Lanús
        </div>
      </footer>
    </div>
  );
}
