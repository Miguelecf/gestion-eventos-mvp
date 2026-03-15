import { createEventFormSchema, eventFormDefaults, toCreateEventInput } from './eventForm.schema';

export const internalEventSchema = createEventFormSchema;

export type InternalEventFormData = import('./eventForm.schema').CreateEventFormValues;

export const internalEventDefaults = eventFormDefaults;

export function toInternalEventPayload(formData: InternalEventFormData) {
  return toCreateEventInput(formData);
}

export function validateAndPreparePayload(rawData: unknown) {
  const formData = internalEventSchema.parse(rawData);
  return toInternalEventPayload(formData);
}

export function safeValidatePayload(rawData: unknown) {
  const result = internalEventSchema.safeParse(rawData);

  if (result.success) {
    return {
      success: true as const,
      data: toInternalEventPayload(result.data),
    };
  }

  return {
    success: false as const,
    error: result.error,
  };
}
