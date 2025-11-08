import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/app-sidebar";
import AppHeader from "@/components/app-header";

export default function AppShell() {
  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-10 md:py-8">
          <div className="mx-auto w-full max-w-[1400px] rounded-tl-3xl bg-slate-50 dark:bg-slate-950 p-6 md:p-8 shadow-sm">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
