import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/AuthProvider";
import { PublicAccessPanel } from "@/features/public/components";

type LoginLocationState = {
  from?: {
    pathname?: string;
  };
};

type LoginError = {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  status?: number;
  message?: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, loading, user } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from =
    (location.state as LoginLocationState | null)?.from?.pathname || "/dashboard";
  const sessionExpired = searchParams.get("sessionExpired") === "true";
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Si el usuario ya está autenticado, redirigir
  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  // Redirigir después de login exitoso
  useEffect(() => {
    if (loginSuccess) {
      navigate(from, { replace: true });
    }
  }, [loginSuccess, navigate, from]);


  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError(null);
  };

  // Validación básica del formulario
  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("El usuario es requerido");
      return false;
    }
    if (!formData.password) {
      setError("La contraseña es requerida");
      return false;
    }
    return true;
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validar formulario
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await login({
        username: formData.username.trim(),
        password: formData.password,
      });

      // Marcar login exitoso para disparar navegación en useEffect
      setLoginSuccess(true);
    } catch (err: unknown) {
      console.error("Error en login:", err);
      const loginError = err as LoginError;
      const status = loginError.response?.status ?? loginError.status;
      const message = loginError.response?.data?.message ?? loginError.message;

      // Manejo específico de errores
      if (status === 401) {
        setError("Usuario o contraseña incorrectos");
      } else if (status === 403) {
        setError("No tienes permisos para acceder");
      } else if (message) {
        setError(message);
      } else {
        setError("Error de conexión. Verificá tu conexión a internet.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <div className="w-full max-w-lg">
      <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
        <div className="mb-8 space-y-6">
          <div className="space-y-3">
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
              ACCESO INTERNO
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
                Acceso interno
              </h1>
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                Ingresá con tu usuario para gestionar eventos y solicitudes.
              </p>
            </div>
          </div>

          <PublicAccessPanel variant="mobile" className="lg:hidden" />
        </div>

        {sessionExpired && !error && (
          <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Tu sesión expiró. Volvé a iniciar sesión para continuar.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-6" noValidate>
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Usuario
            </label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Ingresá tu usuario"
                required
                disabled={isLoading}
                autoComplete="username"
                className="h-12 rounded-xl border-slate-200 bg-white pl-11 shadow-none focus-visible:border-slate-400 focus-visible:ring-slate-300/40 dark:border-slate-700 dark:bg-slate-950 dark:focus-visible:border-slate-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Contraseña
              </label>
              <span className="text-xs font-medium text-slate-400">
                Acceso seguro
              </span>
            </div>

            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Ingresá tu contraseña"
                required
                disabled={isLoading}
                autoComplete="current-password"
                className="h-12 rounded-xl border-slate-200 bg-white pl-11 pr-12 shadow-none focus-visible:border-slate-400 focus-visible:ring-slate-300/40 dark:border-slate-700 dark:bg-slate-950 dark:focus-visible:border-slate-500"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-[#6f1717] text-white shadow-lg shadow-[#6f1717]/20 hover:bg-[#5b1111] dark:bg-[#8f2323] dark:hover:bg-[#a12a2a]"
            disabled={isLoading}
          >
            {isLoading ? "Ingresando..." : "Ingresar a la plataforma"}
          </Button>
        </form>
      </div>
    </div>
  );
}
