import { forwardRef, type ComponentPropsWithoutRef, type MouseEvent } from "react";
import { LogOut } from "lucide-react";

import { cn } from "@/lib/utils";

import { useAuth } from "../AuthProvider";

type LogoutButtonProps = ComponentPropsWithoutRef<"button">;

const LogoutButton = forwardRef<HTMLButtonElement, LogoutButtonProps>(
  ({ className, disabled, onClick, ...props }, ref) => {
    const { logout, loading } = useAuth();

    const handleLogout = async (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);

      if (event.defaultPrevented || loading || disabled) {
        return;
      }

      try {
        await logout();
      } catch (err: unknown) {
        console.error("Error al cerrar la sesión", err);
      } finally {
        // Asegurar redirección al login sea cual sea el resultado.
        try {
          localStorage.removeItem("auth.tokens");
        } catch {
          void 0;
        }

        window.location.href = "/login";
      }
    };

    return (
      <button
        ref={ref}
        {...props}
        type="button"
        onClick={handleLogout}
        disabled={loading || disabled}
        className={cn("flex items-center cursor-pointer", className)}
      >
        <LogOut className="mr-2 h-4 w-4" />
        <span>{loading ? "Cerrando sesión..." : "Cerrar sesión"}</span>
      </button>
    );
  },
);

LogoutButton.displayName = "LogoutButton";

export default LogoutButton;
