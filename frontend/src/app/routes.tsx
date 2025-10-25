import { createBrowserRouter, Navigate } from "react-router-dom";
import AppShell from "./AppShell";
import { PublicLayout } from "./PublicLayout";
import { PrivateRoute } from "./PrivateRoute";
import { RoleRoute } from "./RoleRoute";

// Pages
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { ListPage, CalendarPage, DetailPage, NewPage } from "@/features/events/pages";
import { SpacesPage, DepartmentsPage } from "@/features/catalogs";
import { UsersPage } from "@/features/admin/users/pages/UsersPage";
import { 
  PublicCalendarPage, 
  RequestFormPage, 
  TrackingPage, 
  UnauthorizedPage,
  LoginPage 
} from "@/features/public/pages";

export const router = createBrowserRouter([
  // ========================
  // RUTAS PÚBLICAS (sin auth)
  // ========================
  {
    path: "/login",
    element: <LoginPage />,
  },
  
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/public/calendar",
        element: <PublicCalendarPage />,
      },
      {
        path: "/solicitud",
        element: <RequestFormPage />,
      },
      {
        path: "/track/:uuid",
        element: <TrackingPage />,
      },
    ],
  },

  // ========================
  // RUTAS PROTEGIDAS (requieren auth)
  // ========================
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },

  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          // Dashboard (todos con auth)
          {
            path: "/",
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          
          // ========================
          // EVENTOS (read:Event)
          // ========================
          {
            element: <RoleRoute action="read" subject="Event" />,
            children: [
              {
                path: "/events",
                element: <ListPage />,
              },
              {
                path: "/events/:id",
                element: <DetailPage />,
              },
              {
                path: "/calendar",
                element: <CalendarPage />,
              },
            ],
          },

          // Crear evento (create:Event - SOLO ADMINS)
          {
            element: <RoleRoute action="create" subject="Event" />,
            children: [
              {
                path: "/events/new",
                element: <NewPage />,
              },
            ],
          },

          // ========================
          // CATÁLOGOS (manageCatalogs - SOLO ADMINS)
          // ========================
          {
            element: <RoleRoute action="manageCatalogs" subject="Space" />,
            children: [
              {
                path: "/catalog/spaces",
                element: <SpacesPage />,
              },
              {
                path: "/catalog/departments",
                element: <DepartmentsPage />,
              },
            ],
          },

          // ========================
          // ADMIN USERS (manage:all - SOLO ADMIN_FULL)
          // ========================
          {
            element: <RoleRoute action="manage" subject="all" />,
            children: [
              {
                path: "/admin/users",
                element: <UsersPage />,
              },
            ],
          },
        ],
      },
    ],
  },

  // ========================
  // FALLBACK
  // ========================
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);