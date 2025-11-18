import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/routes";
import "@/index.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/features/auth/AuthProvider"; // 👈 Importá tu provider

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider> 
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  </React.StrictMode>
);
