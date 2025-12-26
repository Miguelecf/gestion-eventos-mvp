/**
 * ===================================================================
 * FORMULARIO DE EVENTOS INTERNOS
 * ===================================================================
 * Implementación completa del formulario para crear eventos internos
 * con validación Zod + React Hook Form.
 * 
 * Secciones:
 * - FEI-04: Datos del evento (name, departmentId, priority, audienceType)
 * - FEI-05: Horarios (date, scheduleFrom, scheduleTo)
 * - FEI-06: Ubicación (spaceId)
 * - FEI-07: Contacto (contactName, contactEmail, contactPhone)
 * - FEI-08: Notas (requirements, coverage, observations)
 * - FEI-09: Flags (internal, requiresTech - solo lectura)
 * - FEI-10: Submit con manejo de errores y redirección
 * ===================================================================
 */

import { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Schema y tipos
import {
  internalEventSchema,
  type InternalEventFormData,
  toInternalEventPayload,
} from '@/schemas/eventInternal.schema';

// API
import { eventsApi } from '@/services/api';
import { extractConflictData } from '@/services/api/utils/error-handler';
import type { AvailabilityConflictResponse } from '@/services/api/types/backend.types';

// Componentes de formulario reutilizables
import {
  FormSectionCard,
  DateField,
  TimeField,
  PrioritySelect,
  AudienceTypeSelect,
  SpaceSelect,
  DepartmentSelect,
} from '@/components/form';
import FormField from '@/components/form/FormField';
import ConflictAlert from '../components/ConflictAlert';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Formulario completo de eventos internos
 * Implementa FEI-04 a FEI-10
 */
export default function InternalEventForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationType, setLocationType] = useState<'space' | 'free'>('space');
  const [conflictData, setConflictData] = useState<AvailabilityConflictResponse | null>(null);
  const conflictAlertRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // SETUP: React Hook Form + Zod Resolver
  // ============================================================
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<InternalEventFormData>({
    resolver: zodResolver(internalEventSchema),
    defaultValues: {
      priority: 'MEDIUM',
      bufferBeforeMin: 15,
      bufferAfterMin: 15,
      requiresTech: false,
      internal: true,
    },
  });

  // Watch para validación en tiempo real
  const scheduleFromValue = watch('scheduleFrom');
  const scheduleToValue = watch('scheduleTo');
  const requiresTechValue = watch('requiresTech');
  
  // Handler para cambio de tipo de ubicación
  const handleLocationTypeChange = (type: 'space' | 'free') => {
    setLocationType(type);
    
    // Limpiar el campo no seleccionado
    if (type === 'space') {
      setValue('freeLocation', undefined);
    } else {
      setValue('spaceId', undefined);
    }
  };

  // Scroll automático a la alerta cuando hay conflicto
  useEffect(() => {
    if (conflictData && conflictAlertRef.current) {
      setTimeout(() => {
        conflictAlertRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }, 100);
    }
  }, [conflictData]);

  // ============================================================
  // FEI-10: SUBMIT HANDLER
  // ============================================================
  const onSubmit = async (data: InternalEventFormData) => {
    setIsSubmitting(true);
    setConflictData(null); // Limpiar conflicto previo

    try {
      // 1. Convertir form data a payload del backend
      const payload = toInternalEventPayload(data);

      // 2. Llamar API para crear evento
      const createdEvent = await eventsApi.createEvent(payload);

      // 3. Mostrar toast de éxito con ID del evento
      toast.success('Evento creado exitosamente', {
        description: `ID del evento: ${createdEvent.id}`,
        duration: 5000,
      });

      // 4. Redirigir a la página de detalle del evento
      navigate(`/events/${createdEvent.id}`);
    } catch (error: any) {
      // Manejo de errores
      console.error('Error al crear evento:', error);

      // Intentar extraer datos de conflicto 409
      const conflict = extractConflictData(error);

      if (conflict) {
        // Error de disponibilidad: mostrar alerta detallada
        setConflictData(conflict);

        toast.error('Conflicto de disponibilidad', {
          description:
            'El espacio no está disponible en el horario seleccionado. Revise los detalles debajo del formulario.',
          duration: 7000,
        });
      } else {
        // Otro tipo de error: mensaje genérico
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Error desconocido al crear el evento';

        toast.error('Error al crear evento', {
          description: errorMessage,
          duration: 7000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // HANDLER: Cancelar y volver atrás
  // ============================================================
  const handleCancel = () => {
    navigate(-1);
  };

  // ============================================================
  // RENDER
  // ============================================================
  
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Nuevo Evento Interno
        </h1>
        <p className="text-muted-foreground">
          Complete el formulario para crear un evento interno. Los campos marcados con{' '}
          <span className="text-red-600">*</span> son obligatorios.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ============================================================ */}
        {/* FEI-04: SECCIÓN "DATOS DEL EVENTO" */}
        {/* ============================================================ */}
        <FormSectionCard
          title="Datos del Evento"
          description="Información básica del evento"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre del evento */}
            <FormField
              label="Nombre del evento"
              htmlFor="name"
              required
              error={errors.name?.message}
              className="md:col-span-2"
            >
              <Input
                id="name"
                type="text"
                placeholder="Ej: Reunión de coordinación"
                aria-invalid={!!errors.name}
                {...register('name')}
              />
            </FormField>

            {/* Departamento */}
            <FormField
              label="Departamento"
              htmlFor="departmentId"
              required
              error={errors.departmentId?.message}
            >
              <DepartmentSelect
                value={watch('departmentId')}
                onChange={(departmentId) => setValue('departmentId', departmentId)}
                error={errors.departmentId?.message}
              />
            </FormField>

            {/* Área solicitante */}
            <FormField
              label="Área solicitante"
              htmlFor="requestingArea"
              error={errors.requestingArea?.message}
              helpText="Área específica dentro del departamento (opcional)"
            >
              <Input
                id="requestingArea"
                type="text"
                placeholder="Ej: Secretaría Académica"
                maxLength={150}
                aria-invalid={!!errors.requestingArea}
                {...register('requestingArea')}
              />
            </FormField>

            {/* Prioridad */}
            <FormField
              label="Prioridad"
              htmlFor="priority"
              required
              error={errors.priority?.message}
            >
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <PrioritySelect
                    value={field.value}
                    onChange={field.onChange}
                    ariaInvalid={!!errors.priority}
                  />
                )}
              />
            </FormField>

            {/* Tipo de audiencia */}
            <FormField
              label="Tipo de audiencia"
              htmlFor="audienceType"
              error={errors.audienceType?.message}
              helpText="Opcional - deje vacío si no aplica"
              className="md:col-span-2"
            >
              <Controller
                name="audienceType"
                control={control}
                render={({ field }) => (
                  <AudienceTypeSelect
                    value={field.value}
                    onChange={field.onChange}
                    ariaInvalid={!!errors.audienceType}
                    allowEmpty={true}
                  />
                )}
              />
            </FormField>
          </div>
        </FormSectionCard>

        {/* ============================================================ */}
        {/* FEI-05: SECCIÓN "HORARIOS" */}
        {/* ============================================================ */}
        <FormSectionCard
          title="Horarios"
          description="Fecha y horarios del evento"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fecha */}
            <FormField
              label="Fecha"
              htmlFor="date"
              required
              error={errors.date?.message}
              helpText="Formato: DD/MM/AAAA"
            >
              <DateField
                id="date"
                aria-invalid={!!errors.date}
                {...register('date')}
              />
            </FormField>

            {/* Hora desde */}
            <FormField
              label="Hora de inicio"
              htmlFor="scheduleFrom"
              required
              error={errors.scheduleFrom?.message}
              helpText="Formato: HH:mm (24h)"
            >
              <TimeField
                id="scheduleFrom"
                aria-invalid={!!errors.scheduleFrom}
                {...register('scheduleFrom')}
              />
            </FormField>

            {/* Hora hasta */}
            <FormField
              label="Hora de fin"
              htmlFor="scheduleTo"
              required
              error={errors.scheduleTo?.message}
              helpText="Formato: HH:mm (24h)"
            >
              <TimeField
                id="scheduleTo"
                aria-invalid={!!errors.scheduleTo}
                {...register('scheduleTo')}
              />
            </FormField>
          </div>

          {/* Validación cruzada: scheduleFrom < scheduleTo */}
          {scheduleFromValue &&
            scheduleToValue &&
            scheduleFromValue >= scheduleToValue && (
              <p className="text-xs text-red-600 mt-2" role="alert">
                ⚠️ La hora de inicio debe ser anterior a la hora de fin
              </p>
            )}
        </FormSectionCard>

        {/* ============================================================ */}
        {/* SECCIÓN "BUFFERS DE TIEMPO" */}
        {/* ============================================================ */}
        <FormSectionCard
          title="Tiempos de Preparación"
          description="Tiempo adicional para preparación y limpieza del espacio"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buffer antes */}
            <FormField
              label="Buffer antes del evento"
              htmlFor="bufferBeforeMin"
              required
              error={errors.bufferBeforeMin?.message}
              helpText="Minutos de preparación antes del inicio (0-240)"
            >
              <div className="flex items-center gap-2">
                <Input
                  id="bufferBeforeMin"
                  type="number"
                  min="0"
                  max="240"
                  step="5"
                  placeholder="15"
                  aria-invalid={!!errors.bufferBeforeMin}
                  {...register('bufferBeforeMin', { valueAsNumber: true })}
                />
                <span className="text-sm text-muted-foreground">min</span>
              </div>
            </FormField>

            {/* Buffer después */}
            <FormField
              label="Buffer después del evento"
              htmlFor="bufferAfterMin"
              required
              error={errors.bufferAfterMin?.message}
              helpText="Minutos de limpieza después del fin (0-240)"
            >
              <div className="flex items-center gap-2">
                <Input
                  id="bufferAfterMin"
                  type="number"
                  min="0"
                  max="240"
                  step="5"
                  placeholder="15"
                  aria-invalid={!!errors.bufferAfterMin}
                  {...register('bufferAfterMin', { valueAsNumber: true })}
                />
                <span className="text-sm text-muted-foreground">min</span>
              </div>
            </FormField>
          </div>

          {/* Información contextual */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">¿Qué son los buffers?</p>
                <p>
                  Los buffers son tiempos adicionales que bloquean el espacio antes y después del evento
                  para permitir preparación, montaje, limpieza y desmontaje. Esto evita que eventos 
                  consecutivos se solapen.
                </p>
                <p className="mt-2">
                  <strong>Ejemplo:</strong> Un evento de 10:00 a 12:00 con buffers de 15 min bloqueará 
                  el espacio de 09:45 a 12:15.
                </p>
              </div>
            </div>
          </div>
        </FormSectionCard>

        {/* ============================================================ */}
        {/* FEI-06: SECCIÓN "UBICACIÓN" */}
        {/* ============================================================ */}
        <FormSectionCard
          title="Ubicación"
          description="Espacio donde se realizará el evento"
        >
          {/* Selector de tipo de ubicación */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">
              Tipo de ubicación <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="locationType"
                  value="space"
                  checked={locationType === 'space'}
                  onChange={() => handleLocationTypeChange('space')}
                  className="w-4 h-4"
                />
                <span className="text-sm">Espacio físico</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="locationType"
                  value="free"
                  checked={locationType === 'free'}
                  onChange={() => handleLocationTypeChange('free')}
                  className="w-4 h-4"
                />
                <span className="text-sm">Ubicación libre</span>
              </label>
            </div>
          </div>

          {/* Campo condicional: Espacio físico */}
          {locationType === 'space' && (
            <FormField
              label="Espacio físico"
              htmlFor="spaceId"
              required
              error={errors.spaceId?.message}
              helpText="Seleccione el espacio registrado en el sistema"
            >
              <SpaceSelect
                value={watch('spaceId')}
                onChange={(spaceId) => setValue('spaceId', spaceId)}
                error={errors.spaceId?.message}
              />
            </FormField>
          )}

          {/* Campo condicional: Ubicación libre */}
          {locationType === 'free' && (
            <FormField
              label="Ubicación libre"
              htmlFor="freeLocation"
              required
              error={errors.freeLocation?.message}
              helpText="Describa la ubicación del evento (máx. 200 caracteres)"
            >
              <Input
                id="freeLocation"
                type="text"
                placeholder="Ej: Centro Cultural Municipal, Av. Principal 123"
                maxLength={200}
                aria-invalid={!!errors.freeLocation}
                {...register('freeLocation')}
              />
            </FormField>
          )}

          {/* Información contextual */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>Espacio físico:</strong> Espacios registrados en el sistema con disponibilidad verificada.
            </p>
            <p className="mt-1">
              <strong>Ubicación libre:</strong> Para eventos fuera de la universidad o en ubicaciones no registradas.
              No se verificará disponibilidad automáticamente.
            </p>
          </div>
        </FormSectionCard>

        {/* ============================================================ */}
        {/* FEI-07: SECCIÓN "CONTACTO" */}
        {/* ============================================================ */}
        <FormSectionCard
          title="Datos de Contacto"
          description="Información de la persona responsable del evento"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre del contacto */}
            <FormField
              label="Nombre completo"
              htmlFor="contactName"
              required
              error={errors.contactName?.message}
            >
              <Input
                id="contactName"
                type="text"
                placeholder="Ej: Juan Pérez"
                aria-invalid={!!errors.contactName}
                {...register('contactName')}
              />
            </FormField>

            {/* Email del contacto */}
            <FormField
              label="Email"
              htmlFor="contactEmail"
              required
              error={errors.contactEmail?.message}
            >
              <Input
                id="contactEmail"
                type="email"
                placeholder="Ej: juan.perez@example.com"
                aria-invalid={!!errors.contactEmail}
                {...register('contactEmail')}
              />
            </FormField>

            {/* Teléfono del contacto */}
            <FormField
              label="Teléfono"
              htmlFor="contactPhone"
              required
              error={errors.contactPhone?.message}
              helpText="Formato argentino: +54 9 11 1234-5678"
              className="md:col-span-2"
            >
              <Input
                id="contactPhone"
                type="tel"
                placeholder="Ej: +54 9 11 1234-5678"
                aria-invalid={!!errors.contactPhone}
                {...register('contactPhone')}
              />
            </FormField>
          </div>
        </FormSectionCard>

        {/* ============================================================ */}
        {/* FEI-08: SECCIÓN "NOTAS" (CAMPOS OPCIONALES) */}
        {/* ============================================================ */}
        <FormSectionCard
          title="Notas Adicionales"
          description="Información complementaria (opcional)"
        >
          <div className="space-y-6">
            {/* Requerimientos especiales */}
            <FormField
              label="Requerimientos especiales"
              htmlFor="requirements"
              error={errors.requirements?.message}
              helpText="Máximo 500 caracteres"
            >
              <textarea
                id="requirements"
                rows={3}
                placeholder="Describa cualquier requerimiento especial para el evento..."
                className="w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none resize-y focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                maxLength={500}
                aria-invalid={!!errors.requirements}
                {...register('requirements')}
              />
            </FormField>

            {/* Cobertura */}
            <FormField
              label="Cobertura"
              htmlFor="coverage"
              error={errors.coverage?.message}
              helpText="Máximo 500 caracteres"
            >
              <textarea
                id="coverage"
                rows={3}
                placeholder="Indique si requiere cobertura fotográfica, streaming, etc..."
                className="w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none resize-y focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                maxLength={500}
                aria-invalid={!!errors.coverage}
                {...register('coverage')}
              />
            </FormField>

            {/* Observaciones */}
            <FormField
              label="Observaciones"
              htmlFor="observations"
              error={errors.observations?.message}
              helpText="Máximo 1000 caracteres"
            >
              <textarea
                id="observations"
                rows={4}
                placeholder="Cualquier observación adicional..."
                className="w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none resize-y focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                maxLength={1000}
                aria-invalid={!!errors.observations}
                {...register('observations')}
              />
            </FormField>
          </div>
        </FormSectionCard>

        {/* ============================================================ */}
        {/* SECCIÓN "SOPORTE TÉCNICO" */}
        {/* ============================================================ */}
        <FormSectionCard
          title="Soporte Técnico"
          description="Configuración de soporte técnico para el evento"
        >
          {/* Checkbox: Requiere técnico */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('requiresTech')}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">
                Este evento requiere soporte técnico
              </span>
            </label>
          </div>

          {/* Campos condicionales si requiresTech = true */}
          {requiresTechValue && (
            <div className="space-y-4 pl-6 border-l-2 border-blue-300 dark:border-blue-700">
              {/* Modo de soporte */}
              <FormField
                label="Modo de soporte"
                htmlFor="techSupportMode"
                required
                error={errors.techSupportMode?.message}
              >
                <Controller
                  name="techSupportMode"
                  control={control}
                  render={({ field }) => (
                    <select
                      id="techSupportMode"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                      aria-invalid={!!errors.techSupportMode}
                    >
                      <option value="">Seleccione...</option>
                      <option value="SETUP_ONLY">Solo montaje y desmontaje</option>
                      <option value="ATTENDED">Soporte completo durante el evento</option>
                    </select>
                  )}
                />
              </FormField>

              {/* Horario técnico */}
              <FormField
                label="Horario de llegada del técnico"
                htmlFor="technicalSchedule"
                error={errors.technicalSchedule?.message}
                helpText="Hora en que el técnico debe llegar (antes del inicio)"
              >
                <TimeField
                  id="technicalSchedule"
                  aria-invalid={!!errors.technicalSchedule}
                  {...register('technicalSchedule')}
                />
              </FormField>

              {/* Información */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Modos de soporte:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>Solo montaje:</strong> El técnico prepara el equipo antes del evento 
                    y lo desmonta después.
                  </li>
                  <li>
                    <strong>Soporte completo:</strong> El técnico permanece durante todo el evento 
                    para asistir con equipos.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </FormSectionCard>

        {/* ============================================================ */}
        {/* BOTONES DE ACCIÓN */}
        {/* ============================================================ */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creando evento...
              </>
            ) : (
              'Crear Evento'
            )}
          </Button>
        </div>
      </form>

      {/* ==================== ALERTA DE CONFLICTO ==================== */}
      {conflictData && (
        <div ref={conflictAlertRef} className="mt-6">
          <ConflictAlert 
            conflictData={conflictData} 
            requestedSpaceId={watch('spaceId')} 
          />
        </div>
      )}
    </div>
  );
}
