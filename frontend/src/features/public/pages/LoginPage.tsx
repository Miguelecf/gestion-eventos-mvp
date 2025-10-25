import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useAppStore } from '@/store';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAppStore(state => state.setAuth);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock de login - REEMPLAZAR CON API REAL
    // Simulación de diferentes usuarios
    let token = 'mock-jwt-token';
    let userId = 'user-123';
    let roles: string[] = [];
    
    if (username === 'admin') {
      roles = ['ROLE_ADMIN_FULL'];
    } else if (username === 'ceremonial') {
      roles = ['ROLE_ADMIN_CEREMONIAL'];
    } else if (username === 'tecnica') {
      roles = ['ROLE_ADMIN_TECNICA'];
    } else {
      roles = ['ROLE_USUARIO'];
    }
    
    setAuth(token, userId, roles);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src="/unlalogo.jpg" alt="UNLA" className="h-16 w-16 mx-auto mb-4 object-contain" />
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>Gestión de Eventos - Universidad Nacional</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Usuario
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="usuario"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Mock users para pruebas:</p>
              <p>• <strong>admin</strong> → ROLE_ADMIN_FULL</p>
              <p>• <strong>ceremonial</strong> → ROLE_ADMIN_CEREMONIAL</p>
              <p>• <strong>tecnica</strong> → ROLE_ADMIN_TECNICA</p>
              <p>• <strong>cualquier otro</strong> → ROLE_USUARIO</p>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" className="w-full">
              Ingresar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
