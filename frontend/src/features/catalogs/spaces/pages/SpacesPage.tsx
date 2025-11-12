import { useState, useEffect } from 'react';
import { Plus, Search, RefreshCcw, Edit, Power } from 'lucide-react';
import { useCatalogsStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppBreadcrumbs } from '@/components/breadcrumbs';
import { SpaceFormDialog } from '../components';
import { toast } from 'sonner';
import type { Space } from '@/services/api';

export function SpacesPage() {
  const {
    spaces,
    spacesPagination,
    spacesFilters,
    loading,
    errors,
    listSpaces,
    setSpacesFilters,
    setSpacesPage,
    setSpacesSize,
    toggleActive,
  } = useCatalogsStore();

  const [searchQuery, setSearchQuery] = useState(spacesFilters.q);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);

  // Carga inicial
  useEffect(() => {
    listSpaces();
  }, [listSpaces]);

  // Debounce búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== spacesFilters.q) {
        setSpacesFilters({ q: searchQuery });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, spacesFilters.q, setSpacesFilters]);

  const handleActiveFilterChange = (value: string) => {
    if (value === 'all') {
      setSpacesFilters({ active: undefined });
    } else {
      setSpacesFilters({ active: value === 'active' });
    }
  };

  const handleToggleActive = async (space: Space) => {
    const action = space.active ? 'desactivar' : 'activar';
    
    if (space.active && !confirm(`¿Desactivar "${space.name}"? No aparecerá en formularios.`)) {
      return;
    }

    const success = await toggleActive(space.id);
    
    if (success) {
      toast.success(`Espacio ${action}do correctamente`);
    } else {
      toast.error(`Error al ${action} el espacio`);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <AppBreadcrumbs />
        
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Espacios</h1>
            <p className="text-muted-foreground">
              Catálogo de espacios físicos para eventos. Configurá capacidad, buffers por defecto y color identificador.
            </p>
          </div>
          
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo espacio
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
                placeholder="Buscar por nombre o ubicación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro Estado */}
            <Select
              value={
                spacesFilters.active === undefined
                  ? 'all'
                  : spacesFilters.active
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
              onClick={() => listSpaces()}
              disabled={loading.spaces}
            >
              <RefreshCcw className={`w-4 h-4 ${loading.spaces ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {errors.spaces && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{errors.spaces}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Espacios Registrados</CardTitle>
              <CardDescription>
                {spacesPagination.totalElements} espacios en total
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading.spaces && spaces.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Cargando espacios...
            </div>
          ) : spaces.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron espacios con los filtros aplicados
            </div>
          ) : (
            <>
              {/* Tabla Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left text-sm font-medium text-muted-foreground">
                      <th className="pb-3 pr-4">Nombre</th>
                      <th className="pb-3 pr-4">Ubicación</th>
                      <th className="pb-3 pr-4 text-right">Capacidad</th>
                      <th className="pb-3 pr-4 text-center">Buffers (min)</th>
                      <th className="pb-3 pr-4">Color</th>
                      <th className="pb-3 pr-4">Estado</th>
                      <th className="pb-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spaces.map((space) => (
                      <tr key={space.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: space.colorHex }}
                            />
                            <span className="font-medium">{space.name}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-sm text-muted-foreground max-w-[200px] truncate">
                          {space.location}
                        </td>
                        <td className="py-4 pr-4 text-right font-medium">
                          {space.capacity}
                        </td>
                        <td className="py-4 pr-4 text-center text-sm">
                          {space.defaultBufferBeforeMin} / {space.defaultBufferAfterMin}
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: space.colorHex }}
                            />
                            <span className="text-xs font-mono text-muted-foreground">
                              {space.colorHex}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <Badge variant={space.active ? 'default' : 'secondary'}>
                            {space.active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingSpace(space)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(space)}
                              disabled={loading.updateSpace}
                            >
                              <Power
                                className={`w-4 h-4 ${
                                  space.active ? 'text-green-600' : 'text-muted-foreground'
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
                {spaces.map((space) => (
                  <Card key={space.id}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: space.colorHex }}
                          />
                          <span className="font-semibold">{space.name}</span>
                        </div>
                        <Badge variant={space.active ? 'default' : 'secondary'}>
                          {space.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>📍 {space.location}</p>
                        <p>👥 Capacidad: {space.capacity}</p>
                        <p>⏱️ Buffers: {space.defaultBufferBeforeMin} / {space.defaultBufferAfterMin} min</p>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingSpace(space)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(space)}
                          disabled={loading.updateSpace}
                        >
                          <Power
                            className={`w-4 h-4 ${
                              space.active ? 'text-green-600' : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Paginación */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Página {spacesPagination.page + 1} de {spacesPagination.totalPages} ·{' '}
                  {spacesPagination.totalElements} espacios
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={String(spacesPagination.size)}
                    onValueChange={(v) => setSpacesSize(Number(v))}
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
                    onClick={() => setSpacesPage(spacesPagination.page - 1)}
                    disabled={spacesPagination.page === 0 || loading.spaces}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSpacesPage(spacesPagination.page + 1)}
                    disabled={
                      spacesPagination.page >= spacesPagination.totalPages - 1 ||
                      loading.spaces
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
      <SpaceFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
      />

      {/* Modal Editar */}
      {editingSpace && (
        <SpaceFormDialog
          open={!!editingSpace}
          onOpenChange={(open) => !open && setEditingSpace(null)}
          mode="edit"
          space={editingSpace}
        />
      )}
    </div>
  );
}

