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
  LoginPage,
} from "@/features/public/pages";

export const router = createBrowserRouter([
  // ========================
  // Public routes
  // ========================
  {
    element: <PublicLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/public/calendar", element: <PublicCalendarPage /> },
      { path: "/solicitud", element: <RequestFormPage /> },
      { path: "/track/:uuid", element: <TrackingPage /> },
    ],
  },

  // Unauthorized page
  { path: "/unauthorized", element: <UnauthorizedPage /> },

  // ========================
  // Protected routes (require auth)
  // ========================
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: <DashboardPage /> },

          // Events (read)
          {
            element: <RoleRoute action="read" subject="Event" />,
            children: [
              { path: "/events", element: <ListPage /> },
              { path: "/events/:id", element: <DetailPage /> },
              { path: "/calendar", element: <CalendarPage /> },
            ],
          },

          // Create event (create)
          {
            element: <RoleRoute action="create" subject="Event" />,
            children: [{ path: "/events/new", element: <NewPage /> }],
          },

          // Catalogs (manageCatalogs)
          {
            element: <RoleRoute action="manageCatalogs" subject="Space" />,
            children: [
              { path: "/catalog/spaces", element: <SpacesPage /> },
              { path: "/catalog/departments", element: <DepartmentsPage /> },
            ],
          },

          // Admin users (manage all)
          {
            element: <RoleRoute action="manage" subject="all" />,
            children: [{ path: "/admin/users", element: <UsersPage /> }],
          },
        ],
      },
    ],
  },

  // Fallback
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);