import { useEffect, useRef } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';

import {
  AudienceTypeSelect,
  DateField,
  DepartmentSelect,
  FormField,
  FormSectionCard,
  PrioritySelect,
  SpaceSelect,
  TimeField,
} from '@/components/form';
import { Input } from '@/components/ui/input';
import type { EventFormValues } from '@/schemas/eventForm.schema';

type EventFormMode = 'create' | 'edit';

interface EventFormSectionsProps {
  form: UseFormReturn<EventFormValues>;
  mode: EventFormMode;
  locationType: 'space' | 'free';
  onLocationTypeChange: (type: 'space' | 'free') => void;
  lockFreeLocationOption?: boolean;
  allowAudienceTypeClear?: boolean;
  allowTechnicalScheduleClear?: boolean;
  syncPriorityWithRequestingArea?: boolean;
}

const textareaClassName =
  'w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none resize-y focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50';

function getErrorMessage(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' ? message : undefined;
  }

  return undefined;
}

export function EventFormSections({
  form,
  mode,
  locationType,
  onLocationTypeChange,
  lockFreeLocationOption = false,
  allowAudienceTypeClear = true,
  allowTechnicalScheduleClear = true,
  syncPriorityWithRequestingArea = false,
}: EventFormSectionsProps) {
  const {
    control,
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const scheduleFromValue = watch('scheduleFrom');
  const scheduleToValue = watch('scheduleTo');
  const requiresTechValue = watch('requiresTech');
  const requestingAreaValue = watch('requestingArea');
  const priorityValue = watch('priority');
  const isRectoradoRequestingArea = requestingAreaValue.trim() === 'Rectorado';
  const hasInitializedPrioritySync = useRef(false);

  useEffect(() => {
    if (!syncPriorityWithRequestingArea || !isRectoradoRequestingArea || priorityValue === 'HIGH') {
      hasInitializedPrioritySync.current = true;
      return;
    }

    setValue('priority', 'HIGH', {
      shouldDirty: hasInitializedPrioritySync.current,
      shouldTouch: hasInitializedPrioritySync.current,
      shouldValidate: true,
    });
    hasInitializedPrioritySync.current = true;
  }, [isRectoradoRequestingArea, priorityValue, setValue, syncPriorityWithRequestingArea]);

  return (
    <>
      <FormSectionCard title="Datos del Evento" description="Información básica del evento">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            label="Nombre del evento"
            htmlFor="name"
            required
            error={getErrorMessage(errors.name)}
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

          <FormField
            label="Departamento"
            htmlFor="departmentId"
            required
            error={getErrorMessage(errors.departmentId)}
          >
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <DepartmentSelect
                  value={field.value}
                  onChange={field.onChange}
                  ariaInvalid={!!errors.departmentId}
                />
              )}
            />
          </FormField>

          <FormField
            label="Área solicitante"
            htmlFor="requestingArea"
            error={getErrorMessage(errors.requestingArea)}
            helpText='Si indicás "Rectorado", la prioridad efectiva será Alta.'
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

          <FormField
            label="Prioridad"
            htmlFor="priority"
            required
            error={getErrorMessage(errors.priority)}
            helpText={
              syncPriorityWithRequestingArea && isRectoradoRequestingArea
                ? 'La prioridad queda forzada a Alta porque el área solicitante es Rectorado.'
                : undefined
            }
          >
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <PrioritySelect
                  value={field.value}
                  onChange={field.onChange}
                  ariaInvalid={!!errors.priority}
                  disabled={syncPriorityWithRequestingArea && isRectoradoRequestingArea}
                />
              )}
            />
          </FormField>

          <FormField
            label="Tipo de audiencia"
            htmlFor="audienceType"
            error={getErrorMessage(errors.audienceType)}
            helpText={
              allowAudienceTypeClear
                ? 'Opcional.'
                : 'Este valor no puede vaciarse en esta versión porque el backend actual no lo soporta.'
            }
            className="md:col-span-2"
          >
            <Controller
              name="audienceType"
              control={control}
              render={({ field }) => (
                <AudienceTypeSelect
                  value={field.value === '' ? undefined : field.value}
                  onChange={(value) => {
                    if (!allowAudienceTypeClear && value === undefined) {
                      return;
                    }
                    field.onChange(value ?? '');
                  }}
                  ariaInvalid={!!errors.audienceType}
                  allowEmpty={allowAudienceTypeClear}
                />
              )}
            />
          </FormField>

          <FormField
            label="Tipo"
            htmlFor="internal"
            error={getErrorMessage(errors.internal)}
            className="md:col-span-2"
          >
            <Controller
              name="internal"
              control={control}
              render={({ field }) => (
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      checked={field.value === true}
                      onChange={() => field.onChange(true)}
                      className="h-4 w-4"
                    />
                    Evento interno
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      checked={field.value === false}
                      onChange={() => field.onChange(false)}
                      className="h-4 w-4"
                    />
                    Evento público
                  </label>
                </div>
              )}
            />
          </FormField>
        </div>
      </FormSectionCard>

      <FormSectionCard title="Horarios" description="Fecha y horarios del evento">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <FormField label="Fecha" htmlFor="date" required error={getErrorMessage(errors.date)}>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DateField
                  id="date"
                  value={field.value}
                  onChange={field.onChange}
                  ariaInvalid={!!errors.date}
                />
              )}
            />
          </FormField>

          <FormField
            label="Hora de inicio"
            htmlFor="scheduleFrom"
            required
            error={getErrorMessage(errors.scheduleFrom)}
          >
            <Controller
              name="scheduleFrom"
              control={control}
              render={({ field }) => (
                <TimeField
                  id="scheduleFrom"
                  value={field.value}
                  onChange={field.onChange}
                  ariaInvalid={!!errors.scheduleFrom}
                />
              )}
            />
          </FormField>

          <FormField label="Hora de fin" htmlFor="scheduleTo" required error={getErrorMessage(errors.scheduleTo)}>
            <Controller
              name="scheduleTo"
              control={control}
              render={({ field }) => (
                <TimeField
                  id="scheduleTo"
                  value={field.value}
                  onChange={field.onChange}
                  ariaInvalid={!!errors.scheduleTo}
                />
              )}
            />
          </FormField>
        </div>

        {scheduleFromValue && scheduleToValue && scheduleFromValue >= scheduleToValue ? (
          <p className="mt-2 text-xs text-red-600" role="alert">
            La hora de inicio debe ser anterior a la hora de fin.
          </p>
        ) : null}
      </FormSectionCard>

      <FormSectionCard
        title="Tiempos de Preparación"
        description="Tiempo adicional para preparación y limpieza del espacio"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            label="Buffer antes del evento"
            htmlFor="bufferBeforeMin"
            required
            error={getErrorMessage(errors.bufferBeforeMin)}
            helpText="Minutos de preparación antes del inicio (0-240)"
          >
            <div className="flex items-center gap-2">
              <Input
                id="bufferBeforeMin"
                type="number"
                min="0"
                max="240"
                step="5"
                aria-invalid={!!errors.bufferBeforeMin}
                {...register('bufferBeforeMin', { valueAsNumber: true })}
              />
              <span className="text-sm text-muted-foreground">min</span>
            </div>
          </FormField>

          <FormField
            label="Buffer después del evento"
            htmlFor="bufferAfterMin"
            required
            error={getErrorMessage(errors.bufferAfterMin)}
            helpText="Minutos de limpieza después del fin (0-240)"
          >
            <div className="flex items-center gap-2">
              <Input
                id="bufferAfterMin"
                type="number"
                min="0"
                max="240"
                step="5"
                aria-invalid={!!errors.bufferAfterMin}
                {...register('bufferAfterMin', { valueAsNumber: true })}
              />
              <span className="text-sm text-muted-foreground">min</span>
            </div>
          </FormField>
        </div>

        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-300">
          Los buffers modifican la ventana efectiva del evento y pueden afectar la disponibilidad real del espacio.
        </div>
      </FormSectionCard>

      <FormSectionCard title="Ubicación" description="Espacio donde se realizará el evento">
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">
            Tipo de ubicación <span className="text-red-600">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                checked={locationType === 'space'}
                onChange={() => onLocationTypeChange('space')}
                className="h-4 w-4"
              />
              Espacio físico
            </label>

            <label
              className={`flex items-center gap-2 text-sm ${lockFreeLocationOption ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
              <input
                type="radio"
                checked={locationType === 'free'}
                onChange={() => !lockFreeLocationOption && onLocationTypeChange('free')}
                className="h-4 w-4"
                disabled={lockFreeLocationOption}
              />
              Ubicación libre
            </label>
          </div>
        </div>

        {lockFreeLocationOption && mode === 'edit' ? (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
            En esta versión no se puede cambiar un evento con espacio físico a ubicación libre porque el backend actual
            no soporta ese cambio.
          </div>
        ) : null}

        {locationType === 'space' ? (
          <FormField
            label="Espacio físico"
            htmlFor="spaceId"
            required
            error={getErrorMessage(errors.spaceId)}
            helpText="Seleccione un espacio registrado en el sistema"
          >
            <Controller
              name="spaceId"
              control={control}
              render={({ field }) => (
                <SpaceSelect
                  value={field.value}
                  onChange={field.onChange}
                  ariaInvalid={!!errors.spaceId}
                />
              )}
            />
          </FormField>
        ) : (
          <FormField
            label="Ubicación libre"
            htmlFor="freeLocation"
            required
            error={getErrorMessage(errors.freeLocation)}
            helpText="No bloquea recursos del sistema"
          >
            <Input
              id="freeLocation"
              type="text"
              placeholder="Ej: Centro Cultural Municipal"
              maxLength={200}
              aria-invalid={!!errors.freeLocation}
              {...register('freeLocation')}
            />
          </FormField>
        )}
      </FormSectionCard>

      <FormSectionCard title="Datos de Contacto" description="Información de la persona responsable del evento">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField label="Nombre completo" htmlFor="contactName" required error={getErrorMessage(errors.contactName)}>
            <Input
              id="contactName"
              type="text"
              placeholder="Ej: Juan Pérez"
              aria-invalid={!!errors.contactName}
              {...register('contactName')}
            />
          </FormField>

          <FormField label="Email" htmlFor="contactEmail" required error={getErrorMessage(errors.contactEmail)}>
            <Input
              id="contactEmail"
              type="email"
              placeholder="Ej: juan.perez@example.com"
              aria-invalid={!!errors.contactEmail}
              {...register('contactEmail')}
            />
          </FormField>

          <FormField
            label="Teléfono"
            htmlFor="contactPhone"
            required
            error={getErrorMessage(errors.contactPhone)}
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

      <FormSectionCard title="Notas Adicionales" description="Información complementaria">
        <div className="space-y-6">
          <FormField
            label="Requerimientos especiales"
            htmlFor="requirements"
            error={getErrorMessage(errors.requirements)}
            helpText="Máximo 255 caracteres"
          >
            <textarea
              id="requirements"
              rows={3}
              maxLength={255}
              className={textareaClassName}
              aria-invalid={!!errors.requirements}
              {...register('requirements')}
            />
          </FormField>

          <FormField
            label="Cobertura"
            htmlFor="coverage"
            error={getErrorMessage(errors.coverage)}
            helpText="Máximo 500 caracteres"
          >
            <textarea
              id="coverage"
              rows={3}
              maxLength={500}
              className={textareaClassName}
              aria-invalid={!!errors.coverage}
              {...register('coverage')}
            />
          </FormField>

          <FormField
            label="Observaciones"
            htmlFor="observations"
            error={getErrorMessage(errors.observations)}
            helpText="Máximo 1000 caracteres"
          >
            <textarea
              id="observations"
              rows={4}
              maxLength={1000}
              className={textareaClassName}
              aria-invalid={!!errors.observations}
              {...register('observations')}
            />
          </FormField>
        </div>
      </FormSectionCard>

      <FormSectionCard title="Soporte Técnico" description="Configuración técnica del evento">
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
            <input type="checkbox" className="h-4 w-4" {...register('requiresTech')} />
            Este evento requiere soporte técnico
          </label>
        </div>

        {requiresTechValue ? (
          <div className="space-y-4 border-l-2 border-blue-300 pl-6 dark:border-blue-700">
            <FormField
              label="Modo de soporte"
              htmlFor="techSupportMode"
              required
              error={getErrorMessage(errors.techSupportMode)}
            >
              <Controller
                name="techSupportMode"
                control={control}
                render={({ field }) => (
                  <select
                    id="techSupportMode"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
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

            <FormField
              label="Horario técnico"
              htmlFor="technicalSchedule"
              error={getErrorMessage(errors.technicalSchedule)}
              helpText={
                allowTechnicalScheduleClear
                  ? 'Informativo. No participa en validaciones.'
                  : 'Este valor no puede vaciarse en esta versión porque el backend actual no lo soporta.'
              }
            >
              <Controller
                name="technicalSchedule"
                control={control}
                render={({ field }) => (
                  <TimeField
                    id="technicalSchedule"
                    value={field.value}
                    onChange={(value) => {
                      if (!allowTechnicalScheduleClear && value === '') {
                        return;
                      }
                      field.onChange(value);
                    }}
                    ariaInvalid={!!errors.technicalSchedule}
                  />
                )}
              />
            </FormField>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Si desactivás técnica, el backend dejará de validar capacidad operativa para este evento.
          </p>
        )}
      </FormSectionCard>
    </>
  );
}

export default EventFormSections;
