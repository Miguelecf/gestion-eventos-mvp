import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { eventsApi } from '@/services/api';
import type { AvailabilityConflictResponse } from '@/services/api/types/backend.types';
import { extractConflictData } from '@/services/api/utils/error-handler';
import ConflictAlert from '@/features/events/components/ConflictAlert';
import EventFormSections from '@/features/events/components/EventFormSections';
import {
  createEventFormSchema,
  eventFormDefaults,
  toCreateEventInput,
  type EventFormValues,
} from '@/schemas/eventForm.schema';

const eventFieldFocusOrder: Array<keyof EventFormValues> = [
  'date',
  'scheduleFrom',
  'scheduleTo',
  'bufferBeforeMin',
  'bufferAfterMin',
  'spaceId',
  'freeLocation',
  'departmentId',
  'requestingArea',
  'contactName',
  'contactEmail',
  'contactPhone',
  'name',
  'priority',
  'audienceType',
  'internal',
  'requiresTech',
  'techSupportMode',
  'technicalSchedule',
  'requirements',
  'coverage',
  'observations',
];

function focusFieldById(fieldId: string): boolean {
  const element =
    document.getElementById(fieldId) ??
    document.querySelector<HTMLElement>(`[name="${fieldId}"]`);

  if (!(element instanceof HTMLElement)) {
    return false;
  }

  element.focus({ preventScroll: true });
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return true;
}

export default function InternalEventForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationType, setLocationType] = useState<'space' | 'free'>('space');
  const [conflictData, setConflictData] = useState<AvailabilityConflictResponse | null>(null);
  const conflictAlertRef = useRef<HTMLDivElement>(null);

  const defaultValues = useMemo<EventFormValues>(() => {
    const queryDate = searchParams.get('date');

    return {
      ...eventFormDefaults,
      date: queryDate && /^\d{4}-\d{2}-\d{2}$/.test(queryDate) ? queryDate : eventFormDefaults.date,
      internal: true,
    };
  }, [searchParams]);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(createEventFormSchema),
    defaultValues,
  });

  const { handleSubmit, setValue, watch } = form;

  useEffect(() => {
    if (conflictData && conflictAlertRef.current) {
      setTimeout(() => {
        conflictAlertRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 100);
    }
  }, [conflictData]);

  const handleLocationTypeChange = (type: 'space' | 'free') => {
    setLocationType(type);

    if (type === 'space') {
      setValue('freeLocation', '');
    } else {
      setValue('spaceId', null);
    }
  };

  const handleInvalidSubmit = (formErrors: FieldErrors<EventFormValues>) => {
    requestAnimationFrame(() => {
      for (const fieldName of eventFieldFocusOrder) {
        if (!formErrors[fieldName]) {
          continue;
        }

        const targetField =
          fieldName === 'freeLocation' && locationType === 'space'
            ? 'spaceId'
            : fieldName === 'spaceId' && locationType === 'free'
              ? 'freeLocation'
              : fieldName;

        if (focusFieldById(targetField)) {
          return;
        }
      }
    });
  };

  const onSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true);
    setConflictData(null);

    try {
      const createdEvent = await eventsApi.createEvent(toCreateEventInput(data));

      toast.success('Evento creado exitosamente', {
        description: `ID del evento: ${createdEvent.id}`,
        duration: 5000,
      });

      navigate(`/events/${createdEvent.id}`);
    } catch (error) {
      const conflict = extractConflictData(error);

      if (conflict) {
        setConflictData(conflict);
        toast.error('Conflicto de disponibilidad', {
          description:
            'El espacio no está disponible en el horario seleccionado. Revisá el detalle debajo del formulario.',
          duration: 7000,
        });
      } else {
        const message =
          (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
            ? error.message
            : null) || 'No se pudo crear el evento';

        toast.error('Error al crear evento', {
          description: message,
          duration: 7000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Evento Interno</h1>
        <p className="text-muted-foreground">
          Completá el formulario para crear un evento interno. Los campos marcados con
          <span className="text-red-600"> *</span> son obligatorios.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)} className="space-y-6">
        <EventFormSections
          form={form}
          mode="create"
          locationType={locationType}
          onLocationTypeChange={handleLocationTypeChange}
          allowAudienceTypeClear={true}
          allowTechnicalScheduleClear={true}
        />

        <div className="flex justify-end gap-4 border-t pt-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creando evento...' : 'Crear Evento'}
          </Button>
        </div>
      </form>

      {conflictData ? (
        <div ref={conflictAlertRef}>
          <ConflictAlert conflictData={conflictData} requestedSpaceId={watch('spaceId') ?? undefined} />
        </div>
      ) : null}
    </div>
  );
}
