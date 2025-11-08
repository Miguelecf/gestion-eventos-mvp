import { Outlet } from 'react-router-dom';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <img src="/unlalogo.jpg" alt="UNLA" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Universidad Nacional</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Gestión de Eventos</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <Outlet />
      </main>
      
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-auto bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-slate-600 dark:text-slate-400">
          © {new Date().getFullYear()} Universidad Nacional de Lanús
        </div>
      </footer>
    </div>
  );
}
