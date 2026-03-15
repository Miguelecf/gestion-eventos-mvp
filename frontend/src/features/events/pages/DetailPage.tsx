/**
 * ===================================================================
 * PÁGINA DE DETALLE DEL EVENTO
 * ===================================================================
 * Pantalla completa para visualizar y gestionar un evento individual
 * 
 * Características:
 * - Carga automática del evento por ID desde URL
 * - Encabezado con breadcrumbs, título, estado e indicadores
 * - Layout de 2 columnas: info del evento + panel de estado/acciones
 * - Sección de comentarios internos con CRUD completo
 * - Gestión de cambios de estado con validaciones del backend
 * - Botón de edición con validación de permisos
 * 
 * Endpoints utilizados:
 * - GET /api/events/{id} - Obtener datos del evento
 * - GET /api/events/{id}/status - Estado actual + transiciones permitidas
 * - POST /api/events/{id}/status - Cambiar estado
 * - GET /api/events/{eventId}/comments - Listar comentarios
 * - POST /api/events/{eventId}/comments - Crear comentario
 * ===================================================================
 */

import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Hooks
import { useEvents } from '@/hooks/api';
import { useEventStatusManager } from '@/features/events/hooks/useEventStatusManager';
import { useEventComments } from '@/features/events/hooks/useEventComments';

// Utilities
import {
  getStatusBadgeVariant,
  getStatusLabel,
  getStatusDescription,
  canEditEvent,
} from '@/features/events/utils/status-helpers';
import { getEditBlockReason } from '@/features/events/utils/edit-event';
import { formatLocalDate } from '@/utils/dates';

// Types
import type { Event } from '@/models/event';
import type { EventStatus } from '@/models/event-status';

// Components
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AppBreadcrumbs } from '@/components/breadcrumbs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Approval Workflow Utilities
import {
  ApprovalBadge,
  formatMissingApprovals,
  formatBuffers,
  getTechSupportModeLabel,
  getApprovalStatusMessage,
  shouldShowApprovalIndicators,
} from '@/features/events/utils/approval-helpers';
import { useTechCapacityStatus } from '@/features/events/hooks/useTechCapacityStatus';

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const parsedEventId = id ? parseInt(id, 10) : NaN;
  const isInvalidEventId = !id || Number.isNaN(parsedEventId);
  const eventId = isInvalidEventId ? 0 : parsedEventId;

  // ============ ESTADO LOCAL ============
  const [event, setEvent] = useState<Event | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | null>(null);
  const [statusReason, setStatusReason] = useState('');
  
  // ✅ NUEVO: Estado para aprobaciones pendientes (solo en memoria)
  const [pendingApprovalInfo, setPendingApprovalInfo] = useState<{
    missing: string[];
  } | null>(null);
  
  // ✅ NUEVO: Estado para historial de aprobaciones colapsable
  const [showApprovalHistory, setShowApprovalHistory] = useState(false);

  // ============ HOOKS ESPECIALIZADOS ============
  const { fetchEventById, loading: loadingEvent } = useEvents();

  const {
    currentStatus,
    allowedTransitions,
    canChangeTo,
    requiresReasonFor,
    changeStatus,
    changing,
    refetch: refetchStatus,
    error: statusError,
  } = useEventStatusManager({
    eventId,
    autoLoad: !isInvalidEventId,
    onStatusChange: (result) => {
      // ✅ NUEVO: Manejar aprobación pendiente
      if (result.approvalPending) {
        setPendingApprovalInfo({ missing: result.missingApprovals });
        toast.warning('Aprobación parcial registrada', {
          description: `Faltan: ${formatMissingApprovals(result.missingApprovals)}`,
        });
      } else {
        setPendingApprovalInfo(null);
        toast.success(`Estado cambiado exitosamente`, {
          description: `Nuevo estado: ${getStatusLabel(result.newStatus)}`,
        });
      }
      
      setShowStatusDialog(false);
      setStatusReason('');
      
      // ✅ NUEVO: Recargar AMBOS: evento Y estado
      loadEvent();
      refetchStatus();
    },
    onError: (error) => {
      // ✅ FIX: Solo mostrar toast para errores que NO sean de permisos
      if (!error.includes('permisos')) {
        toast.error('Error al cambiar estado', {
          description: error,
        });
      }
    },
  });

  const {
    comments,
    loading: loadingComments,
    submitting,
    addComment,
    deleteComment,
    hasMore,
    loadMoreComments,
  } = useEventComments(eventId, { autoLoad: !isInvalidEventId });

  // ✅ NUEVO: Hook para verificar capacidad técnica
  const {
    isSaturated: techCapacitySaturated,
    saturatedBlocks,
  } = useTechCapacityStatus(
    event?.date || null,
    event?.scheduleFrom || null,
    event?.scheduleTo || null,
    event?.requiresTech === true
  );

  // ============ CARGA INICIAL ============
  const loadEvent = useCallback(async () => {
    if (isInvalidEventId) {
      return;
    }

    const data = await fetchEventById(eventId);
    if (data) {
      setEvent(data);
    } else {
      toast.error('Evento no encontrado', {
        description: 'No se pudo cargar la información del evento',
      });
      navigate('/events');
    }
  }, [eventId, fetchEventById, isInvalidEventId, navigate]);

  useEffect(() => {
    if (isInvalidEventId) {
      toast.error('ID de evento inválido');
      navigate('/events');
      return;
    }

    loadEvent();
  }, [isInvalidEventId, loadEvent, navigate]);

  // ✅ FIX: Manejar error de permisos una sola vez (no mostrar toast repetido)
  useEffect(() => {
    if (statusError) {
      if (statusError.includes('permisos')) {
        console.warn('[DetailPage] Sin permisos para gestionar estado:', statusError);
        // No mostrar toast, solo log en consola
      }
    }
  }, [statusError]);

  // ✅ NUEVO: Limpiar estado de aprobación pendiente al desmontar
  useEffect(() => {
    return () => {
      setPendingApprovalInfo(null);
    };
  }, []);

  // ============ HANDLERS ============
  const handleEditClick = () => {
    if (!event) return;

    if (!canEditEvent(event.status)) {
      toast.error('No se puede editar', {
        description: getEditBlockReason(event.status),
      });
      return;
    }

    navigate(`/events/${eventId}/edit`);
  };

  const handleStatusChangeRequest = (targetStatus: EventStatus) => {
    if (!canChangeTo(targetStatus)) {
      toast.error('Transición no permitida');
      return;
    }

    setSelectedStatus(targetStatus);
    setShowStatusDialog(true);
  };

  const handleStatusChangeConfirm = async () => {
    if (!selectedStatus) return;

    const needsReason = requiresReasonFor(selectedStatus);
    if (needsReason && !statusReason.trim()) {
      toast.error('Se requiere un motivo para este cambio de estado');
      return;
    }

    const result = await changeStatus({
      to: selectedStatus,
      reason: statusReason.trim() || undefined,
    });

    if (result) {
      setSelectedStatus(null);
    }
  };

  const handleCommentSubmit = async (body: string) => {
    const success = await addComment(body);
    if (success) {
      toast.success('Comentario agregado');
    }
    return success;
  };

  const handleCommentDelete = async (commentId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
      return;
    }

    const success = await deleteComment(commentId);
    if (success) {
      toast.success('Comentario eliminado');
    }
  };

  // ============ RENDER: LOADING ============
  if (loadingEvent || !event) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando evento...</p>
          </div>
        </div>
      </div>
    );
  }

  // ============ RENDER: PÁGINA COMPLETA ============
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* ============ ENCABEZADO ============ */}
      <div className="space-y-4">
        {/* Breadcrumbs */}
        <AppBreadcrumbs />

        {/* Título y Acciones */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
            <p className="text-muted-foreground">
              Evento #{event.id} · Creado el {new Date(event.createdAt).toLocaleDateString('es-AR')}
            </p>
          </div>

          {/* Botón Editar */}
          <Button
            variant="outline"
            onClick={handleEditClick}
            title={canEditEvent(event.status) ? 'Editar evento' : 'Ver motivo de bloqueo'}
          >
            ✏️ Editar Evento
          </Button>
        </div>

        {/* Badges de Estado e Indicadores */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* ✅ FIX: Validación defensiva para evitar crash si currentStatus es undefined */}
          {(currentStatus || event.status) && (
            <Badge 
              variant={getStatusBadgeVariant(currentStatus || event.status)} 
              className="text-sm px-3 py-1"
            >
              {getStatusLabel(currentStatus || event.status)}
            </Badge>
          )}
          
          {event.internal && (
            <Badge variant="outline" className="text-sm">
              🏢 Evento Interno
            </Badge>
          )}
          
          {!event.internal && (
            <Badge variant="outline" className="text-sm">
              🌐 Evento Público
            </Badge>
          )}
          
          {event.requiresTech && (
            <Badge variant="outline" className="text-sm">
              🔧 Requiere Soporte Técnico
            </Badge>
          )}

          <Badge variant="default" className="text-sm">
            {event.priority}
          </Badge>
          
          {/* ✅ NUEVO: Badge de reprogramación (arriba, discreto) */}
          {event.requiresRebooking && (
            <Badge variant="outline" className="text-sm bg-red-50 text-red-600 border-red-200">
              🔄 Reprogramación
            </Badge>
          )}
        </div>

        {/* Datos Clave Resumidos */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">📅 Fecha y Horario</p>
                <p className="text-base font-semibold">
                  {formatLocalDate(event.date, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {event.scheduleFrom} - {event.scheduleTo}
                </p>
                
                {/* ✅ NUEVO: Mostrar buffers */}
                {formatBuffers(event.bufferBeforeMin, event.bufferAfterMin) && (
                  <p className="text-xs text-muted-foreground">
                    {formatBuffers(event.bufferBeforeMin, event.bufferAfterMin)}
                  </p>
                )}
                
                {/* ✅ NUEVO: Mostrar horario técnico y modo cuando requiresTech */}
                {event.requiresTech && (
                  <div className="mt-2 space-y-1">
                    {event.technicalSchedule && (
                      <p className="text-xs text-muted-foreground">
                        ⚙️ Horario técnico: {event.technicalSchedule}
                      </p>
                    )}
                    {event.techSupportMode && (
                      <p className="text-xs text-muted-foreground">
                        🔧 Soporte: {getTechSupportModeLabel(event.techSupportMode)}
                      </p>
                    )}
                  </div>
                )}
                
                {/* ✅ NUEVO: Badge de reprogramación (contextual, descriptivo) */}
                {event.requiresRebooking && (
                  <Badge variant="outline" className="text-xs mt-2">
                    ⚠️ Requiere reprogramación
                  </Badge>
                )}
                
                {/* ✅ NUEVO: Badge de capacidad técnica saturada */}
                {event.requiresTech && techCapacitySaturated && saturatedBlocks.length > 0 && (
                  <Badge variant="outline" className="text-xs mt-2 bg-red-50 text-red-600 border-red-200">
                    ⚠️ Capacidad técnica colmada ({saturatedBlocks.map(b => b.from).join(', ')})
                  </Badge>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">📍 Espacio Asignado</p>
                <p className="text-base font-semibold">
                  {event.space?.name || event.freeLocation || 'Sin asignar'}
                </p>
                {event.space?.capacity && (
                  <p className="text-sm text-muted-foreground">
                    Capacidad: {event.space.capacity} personas
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">🏛️ Área Organizadora</p>
                <p className="text-base font-semibold">
                  {event.department?.name || event.requestingArea || 'No especificada'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {event.audienceType}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* ============ CUERPO: 2 COLUMNAS ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ============ COLUMNA IZQUIERDA (2/3) ============ */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Evento</CardTitle>
              <CardDescription>Detalles generales y descripción</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Descripción */}
              {event.observations && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Descripción</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {event.observations}
                  </p>
                </div>
              )}

              {/* Grid de Datos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Prioridad</p>
                  <Badge variant="default">{event.priority}</Badge>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Tipo de Audiencia</p>
                  <p className="text-sm text-muted-foreground">{event.audienceType}</p>
                </div>

                {event.contactName && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Responsable</p>
                    <p className="text-sm text-muted-foreground">{event.contactName}</p>
                  </div>
                )}

                {event.contactEmail && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Email de Contacto</p>
                    <a 
                      href={`mailto:${event.contactEmail}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {event.contactEmail}
                    </a>
                  </div>
                )}

                {event.contactPhone && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Teléfono</p>
                    <a 
                      href={`tel:${event.contactPhone}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {event.contactPhone}
                    </a>
                  </div>
                )}
              </div>

              {/* Requisitos Técnicos */}
              {event.requirements && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Requisitos Técnicos</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {event.requirements}
                  </p>
                </div>
              )}

              {/* Cobertura */}
              {event.coverage && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Cobertura Solicitada</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {event.coverage}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* ============ COLUMNA DERECHA (1/3) ============ */}
        <div className="space-y-6">
          
          {/* ✅ NUEVO: Conformidades Requeridas */}
          {shouldShowApprovalIndicators(event.status) && (
            <Card>
              <CardHeader>
                <CardTitle>Conformidades Requeridas</CardTitle>
                <CardDescription>Estado de aprobaciones administrativas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Indicadores de aprobación */}
                <div className="space-y-2">
                  <ApprovalBadge type="ceremonial" approved={event.ceremonialOk} />
                  <ApprovalBadge type="technical" approved={event.technicalOk} />
                </div>

                {/* Mensaje de estado */}
                <p className="text-sm text-muted-foreground">
                  {getApprovalStatusMessage(event.ceremonialOk, event.technicalOk)}
                </p>

                {/* ✅ NUEVO: Historial de aprobaciones colapsable */}
                <Collapsible open={showApprovalHistory} onOpenChange={setShowApprovalHistory}>
                  <Separator className="my-4" />
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-between">
                      <span className="text-xs">Historial de Aprobaciones</span>
                      <span className="text-xs">{showApprovalHistory ? '▲' : '▼'}</span>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <div className="text-xs text-muted-foreground space-y-2">
                      <p>Próximamente: historial detallado de cambios en conformidades.</p>
                      {/* TODO: Integrar con audit log filtrado por ceremonialOk/technicalOk */}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          )}
          
          {/* ✅ NUEVO: Alert de aprobación pendiente */}
          {pendingApprovalInfo && (
            <Alert>
              <AlertDescription>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">Aprobación parcial registrada</p>
                    <p className="text-xs mt-1">
                      Faltan: {formatMissingApprovals(pendingApprovalInfo.missing)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPendingApprovalInfo(null)}
                    className="h-6 w-6 p-0"
                  >
                    ✕
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Estado y Acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Estado y Acciones</CardTitle>
              <CardDescription>Gestión del estado del evento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Estado Actual */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Estado Actual</Label>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={getStatusBadgeVariant(currentStatus || event.status)}
                    className="text-base px-4 py-2"
                  >
                    {getStatusLabel(currentStatus || event.status)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {getStatusDescription(currentStatus || event.status)}
                </p>
              </div>

              {/* Transiciones Permitidas */}
              {allowedTransitions.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cambiar Estado a:</Label>
                    <div className="space-y-2">
                      {allowedTransitions.map((status) => {
                        // ✅ NUEVO: Label personalizado para APROBADO
                        const buttonLabel =
                          status === 'APROBADO'
                            ? 'Aprobar (requiere 2 OK)'
                            : getStatusLabel(status);

                        return (
                          <div key={status} className="space-y-1">
                            <Button
                              variant="outline"
                              className="w-full justify-start"
                              disabled={changing || !canChangeTo(status)}
                              onClick={() => handleStatusChangeRequest(status)}
                            >
                              <span className="mr-2">→</span>
                              {buttonLabel}
                            </Button>
                            
                            {/* ✅ NUEVO: Helper text para RESERVADO */}
                            {status === 'RESERVADO' && (
                              <p className="text-xs text-muted-foreground ml-1">
                                Reservar bloquea el espacio antes de la aprobación final
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {allowedTransitions.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No hay transiciones disponibles desde el estado actual.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Fecha de Creación</p>
                <p className="text-sm">
                  {new Date(event.createdAt).toLocaleString('es-AR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Última Actualización</p>
                <p className="text-sm">
                  {new Date(event.updatedAt).toLocaleString('es-AR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </p>
              </div>

              {event.createdBy && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Creado por</p>
                  <p className="text-sm">
                    {event.createdBy.name} {event.createdBy.lastName}
                  </p>
                </div>
              )}

              {event.lastModifiedBy && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Modificado por</p>
                  <p className="text-sm">
                    {event.lastModifiedBy.name} {event.lastModifiedBy.lastName}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* ============ COMENTARIOS INTERNOS (ANCHO COMPLETO) ============ */}
      <Card>
        <CardHeader>
          <CardTitle>Comentarios Internos</CardTitle>
          <CardDescription>
            Conversaciones y notas internas sobre este evento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formulario para nuevo comentario */}
          <CommentForm onSubmit={handleCommentSubmit} submitting={submitting} />

          <Separator />

          {/* Lista de comentarios */}
          {loadingComments && comments.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Cargando comentarios...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No hay comentarios aún. Sé el primero en comentar.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onDelete={() => handleCommentDelete(comment.id)}
                />
              ))}
            </div>
          )}

          {/* Botón cargar más */}
          {hasMore && (
            <Button
              variant="outline"
              className="w-full"
              onClick={loadMoreComments}
              disabled={loadingComments}
            >
              {loadingComments ? 'Cargando...' : 'Cargar más comentarios'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* ============ DIALOGS ============ */}
      
      {/* Dialog de Confirmación de Cambio de Estado */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado del Evento</DialogTitle>
            <DialogDescription>
              {selectedStatus && (
                <>
                  Vas a cambiar el estado de{' '}
                  <strong>{getStatusLabel(currentStatus || event.status)}</strong> a{' '}
                  <strong>{getStatusLabel(selectedStatus)}</strong>.
                  
                  {/* ✅ NUEVO: Texto educativo para APROBADO */}
                  {selectedStatus === 'APROBADO' && (
                    <>
                      <br /><br />
                      Esta acción registra tu OK (según tu rol). Si falta el otro OK, 
                      el evento quedará <em>pendiente</em>.
                    </>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedStatus && requiresReasonFor(selectedStatus) && (
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo del cambio *</Label>
              <Input
                id="reason"
                placeholder="Ingresa el motivo de este cambio de estado"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                disabled={changing}
              />
              <p className="text-xs text-muted-foreground">
                Este campo es obligatorio para este cambio de estado.
              </p>
            </div>
          )}

          {selectedStatus && !requiresReasonFor(selectedStatus) && (
            <div className="space-y-2">
              <Label htmlFor="reason-optional">Motivo del cambio (opcional)</Label>
              <Input
                id="reason-optional"
                placeholder="Opcionalmente, agrega un comentario sobre este cambio"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                disabled={changing}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowStatusDialog(false);
                setStatusReason('');
                setSelectedStatus(null);
              }}
              disabled={changing}
            >
              Cancelar
            </Button>
            <Button onClick={handleStatusChangeConfirm} disabled={changing}>
              {changing ? 'Procesando...' : 'Confirmar Cambio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

/**
 * Formulario para crear un nuevo comentario
 */
interface CommentFormProps {
  onSubmit: (body: string) => Promise<boolean>;
  submitting: boolean;
}

function CommentForm({ onSubmit, submitting }: CommentFormProps) {
  const [body, setBody] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!body.trim()) {
      toast.error('El comentario no puede estar vacío');
      return;
    }

    const success = await onSubmit(body.trim());
    if (success) {
      setBody('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="new-comment">Nuevo Comentario</Label>
        <textarea
          id="new-comment"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribe tu comentario aquí..."
          className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          disabled={submitting}
        />
      </div>
      <Button type="submit" disabled={submitting || !body.trim()}>
        {submitting ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Publicando...
          </>
        ) : (
          <>
            💬 Publicar Comentario
          </>
        )}
      </Button>
    </form>
  );
}

/**
 * Componente para mostrar un comentario individual
 */
interface CommentItemProps {
  comment: {
    id: number;
    body: string;
    createdAt: string;
    updatedAt: string;
    author: {
      id: number;
      username: string;
      fullName: string;
    };
    isPublic: boolean;
    isEdited: boolean;
  };
  onDelete: () => void;
}

function CommentItem({ comment, onDelete }: CommentItemProps) {
  const isEdited = comment.isEdited;
  const createdDate = new Date(comment.createdAt);
  const updatedDate = new Date(comment.updatedAt);

  return (
    <div className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors">
      {/* Header: Autor + Fecha + Acciones */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">{comment.author.fullName}</p>
            <Badge variant="outline" className="text-xs">
              @{comment.author.username}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {createdDate.toLocaleString('es-AR', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
            {isEdited && (
              <span className="ml-2 italic">
                (editado el{' '}
                {updatedDate.toLocaleString('es-AR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })})
              </span>
            )}
          </p>
        </div>

        {/* Botón eliminar (solo para admins o autor) */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive"
        >
          🗑️
        </Button>
      </div>

      {/* Cuerpo del comentario */}
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.body}</p>

      {/* Badge de visibilidad */}
      {!comment.isPublic && (
        <Badge variant="outline" className="text-xs">
          🔒 Solo Interno
        </Badge>
      )}
    </div>
  );
}

