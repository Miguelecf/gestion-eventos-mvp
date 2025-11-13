/**
 * ===================================================================
 * DEPARTMENTS PAGE - Pantalla CRUD de Departamentos
 * ===================================================================
 */

import { useState, useEffect } from 'react';
import { Plus, Search, RefreshCcw, Edit, Power } from 'lucide-react';
import { useCatalogsStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppBreadcrumbs } from '@/components/breadcrumbs';
import { DepartmentFormDialog } from '../components';
import { toast } from 'sonner';
import type { Department } from '@/services/api';

export function DepartmentsPage() {
  const {
    departments,
    departmentsPagination,
    departmentsFilters,
    loading,
    errors,
    listDepartments,
    createDepartment,
    updateDepartment,
    toggleActiveDepartment,
    setDepartmentsFilters,
    setDepartmentsPage,
    setDepartmentsSize,
  } = useCatalogsStore();

  const [searchQuery, setSearchQuery] = useState(departmentsFilters.q);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  // Carga inicial
  useEffect(() => {
    listDepartments();
  }, [listDepartments]);

  // Debounce búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== departmentsFilters.q) {
        setDepartmentsFilters({ q: searchQuery });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, departmentsFilters.q, setDepartmentsFilters]);

  const handleActiveFilterChange = (value: string) => {
    if (value === 'all') {
      setDepartmentsFilters({ active: undefined });
    } else {
      setDepartmentsFilters({ active: value === 'active' });
    }
  };

  const handleToggleActive = async (department: Department) => {
    const action = department.active ? 'desactivar' : 'activar';
    
    if (department.active && !confirm(`¿Desactivar "${department.name}"? No aparecerá en formularios.`)) {
      return;
    }

    const success = await toggleActiveDepartment(department.id);
    
    if (success) {
      toast.success(`Departamento ${action}do correctamente`);
    } else {
      toast.error(`Error al ${action} el departamento`);
    }
  };

  const handleCreateSubmit = async (data: any) => {
    const result = await createDepartment(data);
    
    if (result) {
      toast.success('Departamento creado correctamente');
      setIsCreateDialogOpen(false);
    } else {
      toast.error(errors.createDepartment || 'Error al crear el departamento');
    }
  };

  const handleEditSubmit = async (data: any) => {
    if (!editingDepartment) return;
    
    const result = await updateDepartment(editingDepartment.id, data);
    
    if (result) {
      toast.success('Departamento actualizado correctamente');
      setEditingDepartment(null);
    } else {
      toast.error(errors.updateDepartment || 'Error al actualizar el departamento');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <AppBreadcrumbs />
        
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Departamentos</h1>
            <p className="text-muted-foreground">
              Catálogo de departamentos solicitantes para eventos. Configurá nombre y color identificador.
            </p>
          </div>
          
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo departamento
          </Button>
        </div>
      </div>

      {/* Toolbar: Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro Estado */}
            <Select
              value={
                departmentsFilters.active === undefined
                  ? 'all'
                  : departmentsFilters.active
                  ? 'active'
                  : 'inactive'
              }
              onValueChange={handleActiveFilterChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>

            {/* Botón Refrescar */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => listDepartments()}
              disabled={loading.departments}
            >
              <RefreshCcw className={`w-4 h-4 ${loading.departments ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Departamentos</CardTitle>
              <CardDescription>
                {departmentsPagination.totalElements} departamento(s) encontrado(s)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading.departments && departments.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : departments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron departamentos con los filtros aplicados
            </div>
          ) : (
            <>
              {/* Tabla Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left text-sm font-medium text-muted-foreground">
                      <th className="pb-3 pr-4">Nombre</th>
                      <th className="pb-3 pr-4">Color</th>
                      <th className="pb-3 pr-4">Estado</th>
                      <th className="pb-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((department) => (
                      <tr key={department.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: department.colorHex }}
                            />
                            <span className="font-medium">{department.name}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: department.colorHex }}
                            />
                            <span className="text-xs font-mono text-muted-foreground">
                              {department.colorHex}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <Badge variant={department.active ? 'default' : 'secondary'}>
                            {department.active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingDepartment(department)}
                              title="Editar departamento"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(department)}
                              disabled={loading.updateDepartment}
                              title={department.active ? 'Desactivar' : 'Activar'}
                            >
                              <Power
                                className={`w-4 h-4 ${
                                  department.active ? 'text-green-600' : 'text-muted-foreground'
                                }`}
                              />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards Mobile */}
              <div className="md:hidden space-y-4">
                {departments.map((department) => (
                  <Card key={department.id}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: department.colorHex }}
                          />
                          <span className="font-semibold">{department.name}</span>
                        </div>
                        <Badge variant={department.active ? 'default' : 'secondary'}>
                          {department.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: department.colorHex }}
                        />
                        <span className="text-xs font-mono text-muted-foreground">
                          {department.colorHex}
                        </span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setEditingDepartment(department)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(department)}
                          disabled={loading.updateDepartment}
                        >
                          {department.active ? 'Desactivar' : 'Activar'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Paginación */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-muted-foreground">
                  Mostrando{' '}
                  <span className="font-medium">
                    {departmentsPagination.page * departmentsPagination.size + 1}
                  </span>{' '}
                  a{' '}
                  <span className="font-medium">
                    {Math.min(
                      (departmentsPagination.page + 1) * departmentsPagination.size,
                      departmentsPagination.totalElements
                    )}
                  </span>{' '}
                  de{' '}
                  <span className="font-medium">
                    {departmentsPagination.totalElements}
                  </span>{' '}
                  resultados
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={String(departmentsPagination.size)}
                    onValueChange={(value) => setDepartmentsSize(Number(value))}
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
                    onClick={() => setDepartmentsPage(departmentsPagination.page - 1)}
                    disabled={departmentsPagination.page === 0}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDepartmentsPage(departmentsPagination.page + 1)}
                    disabled={
                      departmentsPagination.page + 1 >= departmentsPagination.totalPages
                    }
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal Crear */}
      <DepartmentFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
        onSubmit={handleCreateSubmit}
        loading={loading.createDepartment}
      />

      {/* Modal Editar */}
      <DepartmentFormDialog
        open={!!editingDepartment}
        onOpenChange={(open) => !open && setEditingDepartment(null)}
        mode="edit"
        department={editingDepartment}
        onSubmit={handleEditSubmit}
        loading={loading.updateDepartment}
      />
    </div>
  );
}
