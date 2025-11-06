import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/features/auth/AuthProvider';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (error) setError(null);
  };

  // Validación básica del formulario
  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('El usuario es requerido');
      return false;
    }
    if (!formData.password) {
      setError('La contraseña es requerida');
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validar formulario
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await login({ 
        username: formData.username.trim(), 
        password: formData.password 
      });
      
      // Navegar después de login exitoso
      navigate(from, { replace: true });
      
    } catch (err: any) {
      console.error('Error en login:', err);
      
      // Manejo específico de errores
      if (err?.response?.status === 401) {
        setError('Usuario o contraseña incorrectos');
      } else if (err?.response?.status === 403) {
        setError('No tienes permisos para acceder');
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Error de conexión. Verifica tu conexión a internet.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img 
            src="/unlalogo.jpg" 
            alt="UNLA" 
            className="h-16 w-16 mx-auto mb-4 object-contain" 
          />
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>Gestión de Eventos - Universidad Nacional</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin} noValidate>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Usuario
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Ingresa tu usuario"
                required
                disabled={isLoading}
                autoComplete="username"
                className={error ? 'border-red-500' : ''}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Ingresa tu contraseña"
                required
                disabled={isLoading}
                autoComplete="current-password"
                className={error ? 'border-red-500' : ''}
              />
            </div>

            {error && (
              <div 
                role="alert" 
                className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200"
              >
                <strong>Error:</strong> {error}
              </div>
            )}
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Ingresa tus credenciales del sistema</p>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}