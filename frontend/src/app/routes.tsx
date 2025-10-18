import { createBrowserRouter } from "react-router-dom";
import AppShell from "./AppShell";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { ListPage, CalendarPage, DetailPage, NewPage } from "@/features/events/pages";
import { SpacesPage, DepartmentsPage } from "@/features/catalogs";
import { UsersPage } from "@/features/admin/users/pages/UsersPage";
import { PublicCalendarPage, RequestFormPage, TrackingPage } from "@/features/public/pages";

export const router = createBrowserRouter([{
    path: "/", element: <AppShell />,
    children: [
        { path: "/", element: <DashboardPage /> },
        { path: "/dashboard", element: <DashboardPage /> },
        { path: "/calendar", element: <CalendarPage /> },
        { path: "/events", element: <ListPage /> },
        { path: "/events/new", element: <NewPage /> },
        { path: "/events/:id", element: <DetailPage /> },
        { path: "/catalog/spaces", element: <SpacesPage /> },
        { path: "/catalog/departments", element: <DepartmentsPage /> },
        { path: "/admin/users", element: <UsersPage /> },
        { path: "/public/calendar", element: <PublicCalendarPage /> },
        { path: "/solicitar", element: <RequestFormPage /> },
        { path: "/seguimiento/:token", element: <TrackingPage /> },
    ]
}]);