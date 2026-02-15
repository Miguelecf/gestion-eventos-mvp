import { useEffect, useState, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type {
  AdminUser,
  CreateAdminUserInput,
  UpdateAdminUserInput,
  UserPriority,
  UserRole,
  UserRoleOption,
} from '@/models/user-admin';

type FormValues = {
  username: string;
  email: string;
  name: string;
  lastName: string;
  priority: UserPriority;
  role: UserRole;
  active: boolean;
};

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  user?: AdminUser | null;
  roles: UserRoleOption[];
  loading?: boolean;
  onSubmit: (payload: CreateAdminUserInput | UpdateAdminUserInput) => Promise<void>;
}

const DEFAULT_FORM: FormValues = {
  username: '',
  email: '',
  name: '',
  lastName: '',
  priority: 'LOW',
  role: 'USUARIO',
  active: true,
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  user,
  roles,
  loading = false,
  onSubmit,
}: UserFormDialogProps) {
  const [values, setValues] = useState<FormValues>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open) {
      return;
    }

    if (mode === 'edit' && user) {
      setValues({
        username: user.username,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        priority: user.priority,
        role: user.role,
        active: user.active,
      });
      setErrors({});
      return;
    }

    setValues({
      ...DEFAULT_FORM,
      role: roles[0]?.value ?? DEFAULT_FORM.role,
    });
    setErrors({});
  }, [mode, open, roles, user]);

  const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!values.username.trim()) nextErrors.username = 'El usuario es obligatorio';
    if (!values.email.trim()) {
      nextErrors.email = 'El email es obligatorio';
    } else if (!isValidEmail(values.email.trim())) {
      nextErrors.email = 'Email inválido';
    }
    if (!values.name.trim()) nextErrors.name = 'El nombre es obligatorio';
    if (!values.lastName.trim()) nextErrors.lastName = 'El apellido es obligatorio';

    if (mode === 'create') {
      if (!values.role) nextErrors.role = 'El rol es obligatorio';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    if (mode === 'create') {
      const payload: CreateAdminUserInput = {
        username: values.username.trim(),
        email: values.email.trim(),
        name: values.name.trim(),
        lastName: values.lastName.trim(),
        priority: values.priority,
        role: values.role,
        active: values.active,
      };
      await onSubmit(payload);
      return;
    }

    const payload: UpdateAdminUserInput = {
      username: values.username.trim(),
      email: values.email.trim(),
      name: values.name.trim(),
      lastName: values.lastName.trim(),
      priority: values.priority,
    };
    await onSubmit(payload);
  };

  const handleClose = (nextOpen: boolean) => {
    if (loading) return;
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nuevo usuario' : 'Editar usuario'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">
                Usuario <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                value={values.username}
                onChange={(e) => setField('username', e.target.value)}
                disabled={loading}
                aria-invalid={!!errors.username}
              />
              {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => setField('email', e.target.value)}
                disabled={loading}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={values.name}
                onChange={(e) => setField('name', e.target.value)}
                disabled={loading}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Apellido <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                value={values.lastName}
                onChange={(e) => setField('lastName', e.target.value)}
                disabled={loading}
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
            </div>

            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select
                value={values.priority}
                onValueChange={(value: UserPriority) => setField('priority', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">LOW</SelectItem>
                  <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                  <SelectItem value="HIGH">HIGH</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === 'create' && (
              <div className="space-y-2">
                <Label>
                  Rol <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={values.role}
                  onValueChange={(value: UserRole) => setField('role', value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
              </div>
            )}
          </div>

          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="active">Estado inicial</Label>
              <div className="flex items-center gap-3 h-10">
                <Switch
                  id="active"
                  checked={values.active}
                  onCheckedChange={(checked) => setField('active', checked)}
                  disabled={loading}
                />
                <span className="text-sm text-muted-foreground">
                  {values.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : mode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
