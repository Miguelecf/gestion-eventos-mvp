import { useEffect, useState } from 'react';
import { Edit, KeyRound, Plus, RefreshCcw, Search, ShieldCheck, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';
import { AppBreadcrumbs } from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usersApi } from '@/services/api/users';
import type {
  AdminUser,
  CreateAdminUserInput,
  UpdateAdminUserInput,
  UserFilters,
  UserRole,
  UserRoleOption,
} from '@/models/user-admin';
import { UserFormDialog } from '../components';

interface PaginationState {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

const initialPagination: PaginationState = {
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }
  return fallback;
}

function formatLastLogin(value: string | null): string {
  if (!value) return 'Sin login';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin login';
  return date.toLocaleString('es-AR');
}

export function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<UserRoleOption[]>([]);

  const [filters, setFilters] = useState<UserFilters>({
    q: '',
    page: 0,
    size: 20,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>(initialPagination);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [actingUserId, setActingUserId] = useState<number | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const loadRoles = async () => {
    setLoadingRoles(true);
    try {
      const nextRoles = await usersApi.listRoles();
      setRoles(nextRoles);
    } catch (error) {
      toast.error(getErrorMessage(error, 'No se pudieron cargar los roles disponibles'));
    } finally {
      setLoadingRoles(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await usersApi.list(filters);
      setUsers(response.content);
      setPagination({
        page: response.number,
        size: response.size,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, 'No se pudo cargar la lista de usuarios'));
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    void loadRoles();
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [filters.active, filters.page, filters.q, filters.role, filters.size]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => {
        if ((current.q ?? '') === searchQuery && (current.page ?? 0) === 0) {
          return current;
        }
        return { ...current, q: searchQuery, page: 0 };
      });
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const refreshUsers = () => {
    void loadUsers();
  };

  const handleCreate = async (payload: CreateAdminUserInput | UpdateAdminUserInput) => {
    setFormLoading(true);
    try {
      await usersApi.create(payload as CreateAdminUserInput);
      toast.success('Usuario creado correctamente. Se envió contraseña temporal por email.');
      setCreateOpen(false);
      await loadUsers();
    } catch (error) {
      toast.error(getErrorMessage(error, 'No se pudo crear el usuario'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (payload: CreateAdminUserInput | UpdateAdminUserInput) => {
    if (!editingUser) return;

    setFormLoading(true);
    try {
      await usersApi.update(editingUser.id, payload as UpdateAdminUserInput);
      toast.success('Usuario actualizado correctamente');
      setEditingUser(null);
      await loadUsers();
    } catch (error) {
      toast.error(getErrorMessage(error, 'No se pudo actualizar el usuario'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleRoleChange = async (user: AdminUser, nextRole: UserRole) => {
    if (user.role === nextRole) return;

    setActingUserId(user.id);
    try {
      await usersApi.updateRole(user.id, nextRole);
      toast.success(`Rol actualizado para ${user.username}`);
      await loadUsers();
    } catch (error) {
      toast.error(getErrorMessage(error, 'No se pudo cambiar el rol'));
    } finally {
      setActingUserId(null);
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    const action = user.active ? 'desactivar' : 'activar';
    if (user.active && !confirm(`¿Desactivar "${user.username}"?`)) {
      return;
    }

    setActingUserId(user.id);
    try {
      await usersApi.updateStatus(user.id, !user.active);
      toast.success(`Usuario ${action}do correctamente`);
      await loadUsers();
    } catch (error) {
      toast.error(getErrorMessage(error, `No se pudo ${action} el usuario`));
    } finally {
      setActingUserId(null);
    }
  };

  const handleResetPassword = async (user: AdminUser) => {
    if (!confirm(`¿Resetear contraseña de "${user.username}"? Se enviará una temporal por email.`)) {
      return;
    }

    setActingUserId(user.id);
    try {
      await usersApi.resetPassword(user.id);
      toast.success('Contraseña reseteada y enviada por email');
      await loadUsers();
    } catch (error) {
      toast.error(getErrorMessage(error, 'No se pudo resetear la contraseña'));
    } finally {
      setActingUserId(null);
    }
  };

  const handleRoleFilterChange = (value: string) => {
    setFilters((current) => ({
      ...current,
      role: value === 'all' ? undefined : (value as UserRole),
      page: 0,
    }));
  };

  const handleActiveFilterChange = (value: string) => {
    setFilters((current) => ({
      ...current,
      active: value === 'all' ? undefined : value === 'active',
      page: 0,
    }));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-4">
        <AppBreadcrumbs />
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Usuarios & Roles</h1>
            <p className="text-muted-foreground">
              Administración completa de usuarios. Solo perfil ADMIN_FULL.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo usuario
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuario, nombre o email..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filters.role ?? 'all'} onValueChange={handleRoleFilterChange} disabled={loadingRoles}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.active === undefined ? 'all' : filters.active ? 'active' : 'inactive'}
              onValueChange={handleActiveFilterChange}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={refreshUsers} disabled={loadingUsers}>
              <RefreshCcw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>{pagination.totalElements} usuario(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUsers && users.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">Cargando usuarios...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No hay usuarios con esos filtros</div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left text-sm font-medium text-muted-foreground">
                      <th className="pb-3 pr-4">Usuario</th>
                      <th className="pb-3 pr-4">Nombre</th>
                      <th className="pb-3 pr-4">Rol</th>
                      <th className="pb-3 pr-4">Prioridad</th>
                      <th className="pb-3 pr-4">Estado</th>
                      <th className="pb-3 pr-4">Último login</th>
                      <th className="pb-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-4 pr-4">
                          <div className="font-medium">{user.username}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </td>
                        <td className="py-4 pr-4">{`${user.name} ${user.lastName}`}</td>
                        <td className="py-4 pr-4 min-w-[220px]">
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleRoleChange(user, value as UserRole)}
                            disabled={actingUserId === user.id || loadingUsers}
                          >
                            <SelectTrigger className="h-9">
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
                        </td>
                        <td className="py-4 pr-4">
                          <Badge variant="outline">{user.priority}</Badge>
                        </td>
                        <td className="py-4 pr-4">
                          <Badge variant={user.active ? 'default' : 'outline'}>
                            {user.active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="py-4 pr-4 text-sm text-muted-foreground">
                          {formatLastLogin(user.lastLoginAt)}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingUser(user)}
                              disabled={actingUserId === user.id}
                              title="Editar usuario"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResetPassword(user)}
                              disabled={actingUserId === user.id}
                              title="Resetear contraseña"
                            >
                              <KeyRound className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(user)}
                              disabled={actingUserId === user.id}
                              title={user.active ? 'Desactivar usuario' : 'Activar usuario'}
                            >
                              {user.active ? (
                                <ShieldOff className="w-4 h-4 text-amber-600" />
                              ) : (
                                <ShieldCheck className="w-4 h-4 text-green-600" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-4">
                {users.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{user.username}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge variant={user.active ? 'default' : 'outline'}>
                          {user.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm">
                        <p>{`${user.name} ${user.lastName}`}</p>
                        <p className="text-muted-foreground">Prioridad: {user.priority}</p>
                        <p className="text-muted-foreground">Último login: {formatLastLogin(user.lastLoginAt)}</p>
                      </div>

                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user, value as UserRole)}
                        disabled={actingUserId === user.id}
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

                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                          disabled={actingUserId === user.id}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetPassword(user)}
                          disabled={actingUserId === user.id}
                        >
                          <KeyRound className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(user)}
                          disabled={actingUserId === user.id}
                        >
                          {user.active ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-muted-foreground">
                  Página {pagination.page + 1} de {Math.max(pagination.totalPages, 1)}
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={String(pagination.size)}
                    onValueChange={(value) =>
                      setFilters((current) => ({ ...current, size: Number(value), page: 0 }))
                    }
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters((current) => ({ ...current, page: Math.max((current.page ?? 0) - 1, 0) }))}
                    disabled={pagination.page === 0 || loadingUsers}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFilters((current) => ({
                        ...current,
                        page: Math.min((current.page ?? 0) + 1, Math.max(pagination.totalPages - 1, 0)),
                      }))
                    }
                    disabled={pagination.page >= pagination.totalPages - 1 || loadingUsers}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <UserFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        roles={roles}
        loading={formLoading}
        onSubmit={handleCreate}
      />

      {editingUser && (
        <UserFormDialog
          open={!!editingUser}
          onOpenChange={(open) => {
            if (!open) setEditingUser(null);
          }}
          mode="edit"
          user={editingUser}
          roles={roles}
          loading={formLoading}
          onSubmit={handleEdit}
        />
      )}

      {roles.length === 0 && !loadingRoles && (
        <p className="text-sm text-muted-foreground">
          No se encontraron roles disponibles. Verificá el endpoint <code>/api/users/roles</code>.
        </p>
      )}
    </div>
  );
}
