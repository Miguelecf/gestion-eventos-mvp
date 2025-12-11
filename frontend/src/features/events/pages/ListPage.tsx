import { useState, useEffect } from 'react';
import { Plus, Search, RefreshCcw, Eye, Edit, Trash, AlertTriangle, Building2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEventsStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AppBreadcrumbs } from '@/components/breadcrumbs';
import {
  getStatusBadgeVariant,
  getStatusLabel,
  canEditEvent,
  canDeleteEvent,
  getPriorityBadgeVariant,
  getPriorityLabel,
} from '@/features/events/utils/status-helpers';
import { toast } from 'sonner';
import type { Event } from '@/models/event';
import type { EventStatus } from '@/models/event-status';

export function ListPage() {
  const navigate = useNavigate();
  
  const {
    events,
    pagination,
    filters,
    loading,
    errors,
    fetchEvents,
    setFilters,
    setPage,
    setPageSize,
    deleteEvent,
  } = useEventsStore();

  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  // Carga inicial
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Debounce búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== filters.search) {
        setFilters({ search: searchQuery });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filters.search, setFilters]);

  const handleStatusFilterChange = (value: string) => {
    if (value === 'all') {
      setFilters({ status: undefined });
    } else {
      setFilters({ status: [value as EventStatus] });
    }
  };

  const handleTypeFilterChange = (value: string) => {
    if (value === 'all') {
      setFilters({ internal: undefined });
    } else {
      setFilters({ internal: value === 'internal' });
    }
  };

  const handleDeleteClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canDeleteEvent(event.status)) {
      toast.error('Solo se pueden eliminar eventos en estado SOLICITADO');
      return;
    }
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;

    const success = await deleteEvent(eventToDelete.id);
    
    if (success) {
      toast.success('Evento eliminado correctamente');
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    } else {
      toast.error('Error al eliminar el evento');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getAudienceTypeLabel = (audienceType: string) => {
    const labels: Record<string, string> = {
      ESTUDIANTES: 'Estudiantes',
      COMUNIDAD: 'Comunidad',
      MIXTO: 'Mixto',
      DOCENTES: 'Docentes',
      AUTORIDADES: 'Autoridades',
    };
    return labels[audienceType] || audienceType;
  };

  const getTechSupportLabel = (mode: string | null) => {
    if (!mode) return 'Con técnica';
    const labels: Record<string, string> = {
      SETUP_ONLY: 'Solo montaje',
      ATTENDED: 'Acompañamiento completo',
    };
    return labels[mode] || 'Con técnica';
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <AppBreadcrumbs />
        
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
            <p className="text-muted-foreground">
              Gestión completa de eventos institucionales. Configurá horarios, espacios, técnica y más.
            </p>
          </div>
          
          <Button onClick={() => navigate('/events/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo evento
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
                placeholder="Buscar eventos por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro Estado */}
            <Select
              value={filters.status?.[0] || 'all'}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="SOLICITADO">Solicitado</SelectItem>
                <SelectItem value="EN_REVISION">En Revisión</SelectItem>
                <SelectItem value="RESERVADO">Reservado</SelectItem>
                <SelectItem value="APROBADO">Aprobado</SelectItem>
                <SelectItem value="RECHAZADO">Rechazado</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro Tipo */}
            <Select
              value={
                filters.internal === undefined
                  ? 'all'
                  : filters.internal
                  ? 'internal'
                  : 'public'
              }
              onValueChange={handleTypeFilterChange}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="internal">Internos</SelectItem>
                <SelectItem value="public">Públicos</SelectItem>
              </SelectContent>
            </Select>

            {/* Botón Refrescar */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchEvents(true)}
              disabled={loading.events}
            >
              <RefreshCcw className={`w-4 h-4 ${loading.events ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {errors.events && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{errors.events}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Eventos Registrados</CardTitle>
              <CardDescription>
                {pagination.total} eventos en total
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading.events && events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Cargando eventos...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron eventos con los filtros aplicados
            </div>
          ) : (
            <>
              {/* Tabla Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left text-sm font-medium text-muted-foreground">
                      <th className="pb-3 pr-4">Fecha y horario</th>
                      <th className="pb-3 pr-4">Evento</th>
                      <th className="pb-3 pr-4">Ubicación</th>
                      <th className="pb-3 pr-4">Departamento</th>
                      <th className="pb-3 pr-4">Estado</th>
                      <th className="pb-3 pr-4">Prioridad</th>
                      <th className="pb-3 pr-4">Técnica</th>
                      <th className="pb-3 pr-4">Tipo</th>
                      <th className="pb-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr
                        key={event.id}
                        className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        {/* Fecha y horario */}
                        <td className="py-4 pr-4">
                          <div className="space-y-0.5">
                            <div className="font-semibold">{formatDate(event.date)}</div>
                            <div className="text-sm text-muted-foreground">
                              {event.scheduleFrom} – {event.scheduleTo}
                            </div>
                          </div>
                        </td>

                        {/* Evento */}
                        <td className="py-4 pr-4">
                          <div className="space-y-0.5">
                            <div className="font-medium max-w-[250px] truncate" title={event.name}>
                              {event.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {event.audienceType
                                ? getAudienceTypeLabel(event.audienceType)
                                : event.requestingArea || '—'}
                            </div>
                          </div>
                        </td>

                        {/* Ubicación */}
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            {event.space ? (
                              <>
                                <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm max-w-[150px] truncate" title={event.space.name}>
                                  {event.space.name}
                                </span>
                              </>
                            ) : event.freeLocation ? (
                              <>
                                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm max-w-[150px] truncate" title={event.freeLocation}>
                                  {event.freeLocation}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>

                        {/* Departamento */}
                        <td className="py-4 pr-4">
                          {event.department ? (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: event.department.colorHex }}
                              />
                              <span className="text-sm max-w-[150px] truncate" title={event.department.name}>
                                {event.department.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </td>

                        {/* Estado */}
                        <td className="py-4 pr-4">
                          <Badge 
                            variant={getStatusBadgeVariant(event.status)}
                            className={event.status === 'RECHAZADO' ? 'border-red-300 text-red-700 ring-red-200' : ''}
                          >
                            {getStatusLabel(event.status)}
                          </Badge>
                        </td>

                        {/* Prioridad */}
                        <td className="py-4 pr-4">
                          <Badge 
                            variant={getPriorityBadgeVariant(event.priority)}
                            className={event.priority === 'HIGH' ? 'border-red-300 text-red-700 ring-red-200' : ''}
                          >
                            {getPriorityLabel(event.priority)}
                          </Badge>
                        </td>

                        {/* Técnica */}
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            {event.requiresTech ? (
                              <Badge variant="outline" className="text-xs" title={getTechSupportLabel(event.techSupportMode)}>
                                {getTechSupportLabel(event.techSupportMode)}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                            {event.requiresRebooking && (
                              <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                            )}
                          </div>
                        </td>

                        {/* Tipo */}
                        <td className="py-4 pr-4">
                          <Badge variant={event.internal ? 'default' : 'outline'} className="text-xs">
                            {event.internal ? 'INTERNO' : 'PÚBLICO'}
                          </Badge>
                        </td>

                        {/* Acciones */}
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/events/${event.id}`);
                              }}
                              title="Ver detalle"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/events/${event.id}`);
                              }}
                              disabled={!canEditEvent(event.status)}
                              title={canEditEvent(event.status) ? 'Editar evento' : 'No se puede editar este evento'}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDeleteClick(event, e)}
                              disabled={!canDeleteEvent(event.status)}
                              title={canDeleteEvent(event.status) ? 'Eliminar evento' : 'Solo se pueden eliminar eventos solicitados'}
                            >
                              <Trash className="w-4 h-4" />
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
                {events.map((event) => (
                  <Card
                    key={event.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    <CardContent className="pt-6 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-base">{event.name}</div>
                        <Badge 
                          variant={getStatusBadgeVariant(event.status)} 
                          className={event.status === 'RECHAZADO' ? 'border-red-300 text-red-700 ring-red-200 flex-shrink-0' : 'flex-shrink-0'}
                        >
                          {getStatusLabel(event.status)}
                        </Badge>
                      </div>

                      {/* Info principal */}
                      <div className="text-sm space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatDate(event.date)}</span>
                          <span className="text-muted-foreground">
                            {event.scheduleFrom} – {event.scheduleTo}
                          </span>
                        </div>

                        {event.space || event.freeLocation ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {event.space ? (
                              <>
                                <Building2 className="w-4 h-4" />
                                <span>{event.space.name}</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="w-4 h-4" />
                                <span>{event.freeLocation}</span>
                              </>
                            )}
                          </div>
                        ) : null}

                        {event.department && (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: event.department.colorHex }}
                            />
                            <span className="text-muted-foreground">{event.department.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          variant={getPriorityBadgeVariant(event.priority)}
                          className={event.priority === 'HIGH' ? 'border-red-300 text-red-700 ring-red-200' : ''}
                        >
                          {getPriorityLabel(event.priority)}
                        </Badge>
                        <Badge variant={event.internal ? 'default' : 'outline'}>
                          {event.internal ? 'INTERNO' : 'PÚBLICO'}
                        </Badge>
                        {event.requiresTech && (
                          <Badge variant="outline">
                            {getTechSupportLabel(event.techSupportMode)}
                          </Badge>
                        )}
                        {event.requiresRebooking && (
                          <Badge variant="outline" className="text-orange-600">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Reprogramar
                          </Badge>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/events/${event.id}`);
                          }}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                        {canEditEvent(event.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/events/${event.id}`);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {canDeleteEvent(event.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleDeleteClick(event, e)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Paginación */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Página {pagination.page} de {pagination.totalPages} · {pagination.total} eventos
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={String(pagination.pageSize)}
                    onValueChange={(v) => setPageSize(Number(v) as 10 | 20 | 50)}
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
                    onClick={() => setPage(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading.events}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages || loading.events}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal Confirmar Eliminación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar evento?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El evento "{eventToDelete?.name}" será eliminado permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setEventToDelete(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={loading.delete}>
              {loading.delete ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
