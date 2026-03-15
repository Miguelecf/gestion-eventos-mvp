import { useEffect, useState } from 'react';
import { Building2, Eye, MapPin, RefreshCcw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppBreadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePublicRequestsStore } from '@/store/publicRequests.store';
import {
  getAudienceTypeLabel,
  getRequestLocationHint,
  type PublicEventRequest,
} from '@/models/public-request';
import { formatLocalDate } from '@/utils/dates';
import { PublicRequestStatusBadge } from '@/features/publicRequests/components';

export function PublicRequestsListPage() {
  const navigate = useNavigate();
  const {
    requests,
    filters,
    pagination,
    loading,
    errors,
    fetchRequests,
    setFilters,
    setPagination,
  } = usePublicRequestsStore();

  const [searchValue, setSearchValue] = useState(filters.search || '');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const normalizedSearch = searchValue.trim();
      const currentSearch = filters.search?.trim() || '';

      if (normalizedSearch !== currentSearch) {
        setFilters({ search: normalizedSearch });
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [filters.search, searchValue, setFilters]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests, filters.search, pagination.page, pagination.pageSize]);

  const handleRefresh = () => {
    fetchRequests();
  };

  const handleView = (requestId: number) => {
    navigate(`/solicitudes/${requestId}`);
  };

  const currentPageLabel = pagination.totalPages === 0 ? 0 : pagination.page + 1;

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="space-y-4">
        <AppBreadcrumbs />

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Solicitudes</h1>
            <p className="text-muted-foreground">
              Bandeja administrativa de solicitudes recibidas para revisión y conversión a evento.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Buscar por solicitud, tracking, solicitante o email..."
                className="pl-10"
              />
            </div>

            <Select
              value={String(pagination.pageSize)}
              onValueChange={(value) => setPagination({ pageSize: Number(value), page: 0 })}
            >
              <SelectTrigger className="w-full md:w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 por página</SelectItem>
                <SelectItem value="20">20 por página</SelectItem>
                <SelectItem value="50">50 por página</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={loading.requests}
            >
              <RefreshCcw className={`h-4 w-4 ${loading.requests ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {errors.requests ? (
        <Card className="border-destructive">
          <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium text-destructive">No se pudieron cargar las solicitudes</p>
              <p className="text-sm text-muted-foreground">{errors.requests}</p>
            </div>
            <Button variant="outline" onClick={handleRefresh}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Solicitudes recibidas</CardTitle>
              <CardDescription>
                {pagination.totalElements} solicitudes visibles en la bandeja actual
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading.requests && requests.length === 0 ? (
            <div className="py-14 text-center text-muted-foreground">Cargando solicitudes...</div>
          ) : requests.length === 0 ? (
            <div className="py-14 text-center">
              <p className="font-medium">No hay solicitudes para mostrar.</p>
              <p className="text-sm text-muted-foreground">
                Ajustá la búsqueda o refrescá la bandeja para volver a consultar.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left text-sm font-medium text-muted-foreground">
                      <th className="pb-3 pr-4">Fecha y horario</th>
                      <th className="pb-3 pr-4">Evento / Solicitud</th>
                      <th className="pb-3 pr-4">Ubicación</th>
                      <th className="pb-3 pr-4">Solicitante</th>
                      <th className="pb-3 pr-4">Estado</th>
                      <th className="pb-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <RequestTableRow
                        key={request.id}
                        request={request}
                        onView={handleView}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-4 md:hidden">
                {requests.map((request) => (
                  <RequestMobileCard
                    key={request.id}
                    request={request}
                    onView={handleView}
                  />
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Página {currentPageLabel} de {pagination.totalPages} · {pagination.totalElements} solicitudes
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ page: pagination.page - 1 })}
                    disabled={pagination.page === 0 || loading.requests}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ page: pagination.page + 1 })}
                    disabled={
                      loading.requests ||
                      pagination.totalPages === 0 ||
                      pagination.page >= pagination.totalPages - 1
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
    </div>
  );
}

interface RequestRowProps {
  request: PublicEventRequest;
  onView: (requestId: number) => void;
}

function RequestTableRow({ request, onView }: RequestRowProps) {
  return (
    <tr
      className="cursor-pointer border-b last:border-0 hover:bg-muted/50"
      onClick={() => onView(request.id)}
    >
      <td className="py-4 pr-4">
        <div className="space-y-0.5">
          <div className="font-semibold">
            {formatLocalDate(request.date, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
          <div className="text-sm text-muted-foreground">
            {request.scheduleFrom} - {request.scheduleTo}
          </div>
        </div>
      </td>

      <td className="py-4 pr-4">
        <div className="space-y-0.5">
          <div className="max-w-[260px] truncate font-medium" title={request.name}>
            {request.name}
          </div>
          <div className="text-sm text-muted-foreground">
            Audiencia: {getAudienceTypeLabel(request.audienceType)}
          </div>
        </div>
      </td>

      <td className="py-4 pr-4">
        <RequestLocation request={request} />
      </td>

      <td className="py-4 pr-4">
        <div className="space-y-0.5">
          <div className="text-sm font-medium">{request.contactName}</div>
          <div className="max-w-[220px] truncate text-xs text-muted-foreground" title={request.contactEmail}>
            {request.contactEmail}
          </div>
          {request.requestingDepartment ? (
            <div className="text-xs text-muted-foreground">{request.requestingDepartment.name}</div>
          ) : null}
        </div>
      </td>

      <td className="py-4 pr-4">
        <PublicRequestStatusBadge status={request.status} />
      </td>

      <td className="py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            onView(request.id);
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver
        </Button>
      </td>
    </tr>
  );
}

function RequestMobileCard({ request, onView }: RequestRowProps) {
  return (
    <Card className="cursor-pointer hover:bg-muted/50" onClick={() => onView(request.id)}>
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="font-semibold">{request.name}</div>
            <div className="text-sm text-muted-foreground">
              {formatLocalDate(request.date, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
              {' · '}
              {request.scheduleFrom} - {request.scheduleTo}
            </div>
          </div>
          <PublicRequestStatusBadge status={request.status} className="shrink-0" />
        </div>

        <div className="space-y-2 text-sm">
          <RequestLocation request={request} />
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">{request.contactName}</span>
            <br />
            {request.contactEmail}
          </div>
          <div className="text-muted-foreground">
            Audiencia: {getAudienceTypeLabel(request.audienceType)}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={(event) => {
            event.stopPropagation();
            onView(request.id);
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver
        </Button>
      </CardContent>
    </Card>
  );
}

function RequestLocation({ request }: { request: PublicEventRequest }) {
  const hint = getRequestLocationHint(request);
  const label = request.space?.name || request.freeLocation || 'Sin ubicación definida';

  if (request.space) {
    return (
      <div className="flex items-start gap-2">
        <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <div className="max-w-[180px] truncate text-sm" title={request.space.name}>
            {request.space.name}
          </div>
          {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
        </div>
      </div>
    );
  }

  if (request.freeLocation) {
    return (
      <div className="flex items-start gap-2">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <div className="max-w-[180px] truncate text-sm" title={request.freeLocation}>
            {request.freeLocation}
          </div>
          {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
        </div>
      </div>
    );
  }

  return <span className="text-sm text-muted-foreground">{label}</span>;
}
