import { useState, useEffect } from 'react';
import { Search, RefreshCcw, Eye, Building2, MapPin } from 'lucide-react';
import { usePublicRequestsStore } from '@/store/publicRequests.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppBreadcrumbs } from '@/components/breadcrumbs';
import {
  getRequestStatusBadgeVariant,
  getRequestStatusLabel,
  getRequestStatusColor,
  getRequestStatusDescription,
  getTechSupportLabel,
  getTechSupportColor,
  getAudienceTypeLabel,
} from '@/models/public-request';
import type { PublicEventRequest, PublicRequestStatus } from '@/models/public-request';

export function PublicRequestsListPage() {
  const {
    requests,
    pagination,
    filters,
    loading,
    errors,
    fetchRequests,
    setFilters,
    setPage,
    setPageSize,
  } = usePublicRequestsStore();

  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  // Carga inicial
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

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
    } else if (value === 'nuevas') {
      setFilters({ status: ['NUEVA', 'EN_REVISION'] });
    } else {
      setFilters({ status: [value as PublicRequestStatus] });
    }
  };

  const handleViewClick = (request: PublicEventRequest, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implementar navegación al detalle cuando esté disponible
    console.log('Ver solicitud:', request.id);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isNewRequest = (request: PublicEventRequest) => {
    return request.status === 'NUEVA';
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <AppBreadcrumbs />
        
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Solicitudes de Eventos</h1>
            <p className="text-muted-foreground">
              Gestión de solicitudes públicas de eventos. Revisá, aprobá o rechazá nuevas peticiones.
            </p>
          </div>
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
                placeholder="Buscar por nombre, solicitante o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro Estado */}
            <Select
              value={
                !filters.status
                  ? 'all'
                  : filters.status.length === 2 && filters.status.includes('NUEVA') && filters.status.includes('EN_REVISION')
                  ? 'nuevas'
                  : filters.status[0]
              }
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nuevas">Nuevas + En revisión</SelectItem>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="NUEVA">Nueva</SelectItem>
                <SelectItem value="EN_REVISION">En Revisión</SelectItem>
                <SelectItem value="CONVERTIDA">Convertida</SelectItem>
                <SelectItem value="RECHAZADA">Rechazada</SelectItem>
              </SelectContent>
            </Select>

            {/* Select Mostrar */}
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">Mostrar 10</SelectItem>
                <SelectItem value="25">Mostrar 25</SelectItem>
                <SelectItem value="50">Mostrar 50</SelectItem>
              </SelectContent>
            </Select>

            {/* Botón Refrescar */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchRequests(true)}
              disabled={loading.requests}
            >
              <RefreshCcw className={`w-4 h-4 ${loading.requests ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {errors.requests && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{errors.requests}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Solicitudes Públicas</CardTitle>
              <CardDescription>
                {pagination.totalElements} solicitudes en total
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading.requests && requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Cargando solicitudes...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron solicitudes con los filtros aplicados
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
                      <th className="pb-3 pr-4">Solicitante</th>
                      <th className="pb-3 pr-4">Técnica</th>
                      <th className="pb-3 pr-4">Estado</th>
                      <th className="pb-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr
                        key={request.id}
                        className={`border-b last:border-0 hover:bg-muted/50 cursor-pointer ${
                          isNewRequest(request) ? 'border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => handleViewClick(request, {} as React.MouseEvent)}
                      >
                        {/* Fecha y horario */}
                        <td className="py-4 pr-4">
                          <div className="space-y-0.5">
                            <div className="font-semibold">{formatDate(request.date)}</div>
                            <div className="text-sm text-muted-foreground">
                              {request.scheduleFrom} – {request.scheduleTo}
                            </div>
                          </div>
                        </td>

                        {/* Evento */}
                        <td className="py-4 pr-4">
                          <div className="space-y-0.5">
                            <div className="font-medium max-w-[250px] truncate" title={request.name}>
                              {request.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Audiencia: {getAudienceTypeLabel(request.audienceType)}
                            </div>
                          </div>
                        </td>

                        {/* Ubicación */}
                        <td className="py-4 pr-4">
                          <div className="flex items-start gap-2">
                            {request.space ? (
                              <>
                                <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <div className="text-sm max-w-[150px] truncate" title={request.space.name}>
                                    {request.space.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">Espacio UNLa</div>
                                </div>
                              </>
                            ) : request.freeLocation ? (
                              <>
                                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <div className="text-sm max-w-[150px] truncate" title={request.freeLocation}>
                                    {request.freeLocation}
                                  </div>
                                  <div className="text-xs text-muted-foreground">Otra ubicación</div>
                                </div>
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>

                        {/* Solicitante */}
                        <td className="py-4 pr-4">
                          <div className="space-y-0.5">
                            <div className="text-sm font-medium">{request.contactName}</div>
                            <div className="text-xs text-muted-foreground max-w-[180px] truncate" title={request.contactEmail}>
                              {request.contactEmail}
                            </div>
                            {request.requestingDepartment && (
                              <div className="text-xs text-muted-foreground">
                                {request.requestingDepartment.name}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Técnica */}
                        <td className="py-4 pr-4">
                          <Badge
                            variant="outline"
                            className={getTechSupportColor(request.requiresTech, request.techSupportMode)}
                            title={getTechSupportLabel(request.requiresTech, request.techSupportMode)}
                          >
                            {request.requiresTech ? (
                              request.techSupportMode === 'SETUP_ONLY' ? '🔧 Montaje' :
                              request.techSupportMode === 'FULL_SUPPORT' ? '⚡ Acompañamiento' :
                              '🎚 Técnica'
                            ) : (
                              'Sin técnica'
                            )}
                          </Badge>
                        </td>

                        {/* Estado */}
                        <td className="py-4 pr-4">
                          <Badge
                            variant={getRequestStatusBadgeVariant(request.status)}
                            className={getRequestStatusColor(request.status)}
                            title={getRequestStatusDescription(request.status)}
                          >
                            {getRequestStatusLabel(request.status)}
                          </Badge>
                        </td>

                        {/* Acciones */}
                        <td className="py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleViewClick(request, e)}
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards Mobile */}
              <div className="md:hidden space-y-4">
                {requests.map((request) => (
                  <Card
                    key={request.id}
                    className={`cursor-pointer hover:bg-muted/50 ${
                      isNewRequest(request) ? 'border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => handleViewClick(request, {} as React.MouseEvent)}
                  >
                    <CardContent className="pt-6 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-base">{request.name}</div>
                        <Badge
                          variant={getRequestStatusBadgeVariant(request.status)}
                          className={`${getRequestStatusColor(request.status)} flex-shrink-0`}
                        >
                          {getRequestStatusLabel(request.status)}
                        </Badge>
                      </div>

                      {/* Info principal */}
                      <div className="text-sm space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatDate(request.date)}</span>
                          <span className="text-muted-foreground">
                            {request.scheduleFrom} – {request.scheduleTo}
                          </span>
                        </div>

                        {request.space || request.freeLocation ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {request.space ? (
                              <>
                                <Building2 className="w-4 h-4" />
                                <span>{request.space.name}</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="w-4 h-4" />
                                <span>{request.freeLocation}</span>
                              </>
                            )}
                          </div>
                        ) : null}

                        <div className="text-muted-foreground">
                          <span className="font-medium text-foreground">{request.contactName}</span>
                          <br />
                          {request.contactEmail}
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {getAudienceTypeLabel(request.audienceType)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={getTechSupportColor(request.requiresTech, request.techSupportMode)}
                        >
                          {getTechSupportLabel(request.requiresTech, request.techSupportMode)}
                        </Badge>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleViewClick(request, e)}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver detalle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Paginación */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Página {pagination.page + 1} de {pagination.totalPages} · {pagination.totalElements} solicitudes
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(pagination.page - 1)}
                    disabled={pagination.page === 0 || loading.requests}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages - 1 || loading.requests}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
