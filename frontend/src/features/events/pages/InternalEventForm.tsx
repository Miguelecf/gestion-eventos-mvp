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

import { useState } from 'react';
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

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

/**
 * Formulario completo de eventos internos
 * Implementa FEI-04 a FEI-10
 */
export default function InternalEventForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      audienceType: 'ESTUDIANTES',
    },
  });

  // Watch para validación en tiempo real
  const scheduleFromValue = watch('scheduleFrom');
  const scheduleToValue = watch('scheduleTo');

  // ============================================================
  // FEI-10: SUBMIT HANDLER
  // ============================================================
  const onSubmit = async (data: InternalEventFormData) => {
     console.log('🔍 1. DATA DEL FORMULARIO:', data);
     console.log('🔍 2. data.priority:', data.priority);

    setIsSubmitting(true);

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
      // Manejo de errores con toast
      console.error('Error al crear evento:', error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Error desconocido al crear el evento';

      toast.error('Error al crear evento', {
        description: errorMessage,
        duration: 7000,
      });
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
              required
              error={errors.audienceType?.message}
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
        {/* FEI-06: SECCIÓN "UBICACIÓN" */}
        {/* ============================================================ */}
        <FormSectionCard
          title="Ubicación"
          description="Espacio donde se realizará el evento"
        >
          <FormField
            label="Espacio"
            htmlFor="spaceId"
            required
            error={errors.spaceId?.message}
            helpText="Seleccione el espacio físico para el evento"
          >
            <SpaceSelect
              value={watch('spaceId')}
              onChange={(spaceId) => setValue('spaceId', spaceId)}
              error={errors.spaceId?.message}
            />
          </FormField>
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
        {/* FEI-09: SECCIÓN "CONFIGURACIÓN" (READ-ONLY FLAGS) */}
        {/* ============================================================ */}
        <Card className="p-6 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5 text-blue-600 dark:text-blue-400"
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
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Configuración del Evento
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Este evento se creará con la siguiente configuración predeterminada para eventos
                internos:
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-white dark:bg-blue-950/50">
                  🏢 Evento Interno
                </Badge>
                <Badge variant="outline" className="bg-white dark:bg-blue-950/50">
                  🔧 Sin soporte técnico requerido
                </Badge>
                <Badge variant="outline" className="bg-white dark:bg-blue-950/50">
                  ⏱️ Sin buffers de tiempo
                </Badge>
                <Badge variant="outline" className="bg-white dark:bg-blue-950/50">
                  📍 Ubicación fija (espacio seleccionado)
                </Badge>
              </div>
            </div>
          </div>
        </Card>

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
    </div>
  );
}
