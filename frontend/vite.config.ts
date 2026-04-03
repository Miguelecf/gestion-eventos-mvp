import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path";
import tailwind from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwind()],
  // Explicit for dev containers: Vite must bind to all interfaces
  // so the host browser can reach the frontend.
  server: {
    host: "0.0.0.0",
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") }
  }
})
