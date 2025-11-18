/**
 * ===================================================================
 * SCHEMA: Evento Interno (MVP)
 * ===================================================================
 * Validaciones con Zod para formulario de creación de eventos internos.
 * Reutiliza tipos y validadores existentes del proyecto.
 * ===================================================================
 */

import { z } from 'zod';
import { Priority, AudienceType } from '@/services/api/types';
import { emailSchema, phoneSchema } from '@/services/api/utils/validation-schemas';

// ==================== ENUMS PARA EL FORMULARIO ====================

/**
 * Enum de Prioridad (reutiliza tipos del backend)
 */
export const PrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export type PriorityType = z.infer<typeof PrioritySchema>;

/**
 * Enum de Tipo de Audiencia (reutiliza tipos del backend)
 */
export const AudienceTypeSchema = z.enum([
  'ESTUDIANTES',
  'COMUNIDAD',
  'MIXTO',
  'DOCENTES',
  'AUTORIDADES'
]);
export type AudienceTypeType = z.infer<typeof AudienceTypeSchema>;

// ==================== VALIDACIONES CUSTOM ====================

/**
 * Validación de fecha futura (fecha debe ser hoy o posterior)
 */
const futureDateValidation = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizar a medianoche
  return date >= today;
};

/**
 * Validación de formato de fecha yyyy-MM-dd
 */
const dateFormatRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/**
 * Validación de formato de hora HH:mm (24h)
 */
const timeFormatRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Validación de teléfono argentino
 * Formatos aceptados:
 * - +54 9 11 1234-5678
 * - +54 11 1234-5678
 * - 011 1234-5678
 * - +5491112345678
 */
const argentinePhoneRegex = /^(\+?54)?[\s-]?9?[\s-]?\d{2,4}[\s-]?\d{6,8}$/;

// ==================== SCHEMA PRINCIPAL ====================

/**
 * Schema de validación para formulario de evento interno
 * 
 * Campos requeridos:
 * - name: Nombre del evento (3-200 chars)
 * - departmentId: ID del departamento organizador
 * - priority: Prioridad del evento (LOW, MEDIUM, HIGH)
 * - audienceType: Tipo de audiencia (ESTUDIANTES, COMUNIDAD, MIXTO, DOCENTES, AUTORIDADES)
 * - date: Fecha del evento (yyyy-MM-dd, hoy o futura)
 * - scheduleFrom: Hora de inicio (HH:mm)
 * - scheduleTo: Hora de fin (HH:mm, debe ser > scheduleFrom)
 * - spaceId: ID del espacio físico
 * - contactName: Nombre del contacto
 * - contactEmail: Email del contacto
 * - contactPhone: Teléfono del contacto
 * 
 * Campos opcionales:
 * - requirements: Requerimientos especiales
 * - coverage: Cobertura esperada
 * - observations: Observaciones adicionales
 */
export const internalEventSchema = z.object({
  // ============ DATOS DEL EVENTO ============
  
  name: z.string({
    required_error: 'El nombre del evento es requerido',
    invalid_type_error: 'El nombre debe ser texto'
  })
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre no puede superar los 200 caracteres')
    .trim(),
  
  departmentId: z.number({
    required_error: 'Debe seleccionar un departamento',
    invalid_type_error: 'Departamento inválido'
  })
    .int('El ID del departamento debe ser un número entero')
    .positive('Debe seleccionar un departamento válido'),
  
  priority: PrioritySchema, 
  
  audienceType: AudienceTypeSchema,
  
  // ============ HORARIOS ============
  
  date: z.string({
    required_error: 'La fecha del evento es requerida',
    invalid_type_error: 'Formato de fecha inválido'
  })
    .regex(dateFormatRegex, 'La fecha debe estar en formato yyyy-MM-dd (ej: 2025-11-15)')
    .refine(futureDateValidation, {
      message: 'La fecha debe ser hoy o futura'
    }),
  
  scheduleFrom: z.string({
    required_error: 'La hora de inicio es requerida',
    invalid_type_error: 'Formato de hora inválido'
  })
    .regex(timeFormatRegex, 'La hora debe estar en formato HH:mm (ej: 09:30)'),
  
  scheduleTo: z.string({
    required_error: 'La hora de fin es requerida',
    invalid_type_error: 'Formato de hora inválido'
  })
    .regex(timeFormatRegex, 'La hora debe estar en formato HH:mm (ej: 11:30)'),
  
  // ============ UBICACIÓN ============
  
  spaceId: z.number({
    required_error: 'Debe seleccionar un espacio',
    invalid_type_error: 'Espacio inválido'
  })
    .int('El ID del espacio debe ser un número entero')
    .positive('Debe seleccionar un espacio válido'),
  
  // ============ CONTACTO ============
  
  contactName: z.string({
    required_error: 'El nombre del contacto es requerido',
    invalid_type_error: 'El nombre debe ser texto'
  })
    .min(2, 'El nombre del contacto debe tener al menos 2 caracteres')
    .max(100, 'El nombre del contacto no puede superar los 100 caracteres')
    .trim(),
  
  contactEmail: emailSchema
    .refine(email => email.length > 0, {
      message: 'El email del contacto es requerido'
    }),
  
  contactPhone: z.string({
    required_error: 'El teléfono del contacto es requerido',
    invalid_type_error: 'El teléfono debe ser texto'
  })
    .regex(argentinePhoneRegex, 'Formato de teléfono argentino inválido (ej: +54 9 11 1234-5678 o 011 1234-5678)')
    .trim(),
  
  // ============ NOTAS (OPCIONALES) ============
  
  requirements: z.string()
    .max(1000, 'Los requerimientos no pueden superar los 1000 caracteres')
    .default(''),
  
  coverage: z.string()
    .max(500, 'La cobertura no puede superar los 500 caracteres')
    .default(''),
  
  observations: z.string()
    .max(2000, 'Las observaciones no pueden superar los 2000 caracteres')
    .default(''),
  
}).refine(
  // =============== VALIDACIÓN CROSS-FIELD: scheduleFrom < scheduleTo ===============
  (data) => {
    // Parsear horas a minutos para comparar
    const [fromHour, fromMin] = data.scheduleFrom.split(':').map(Number);
    const [toHour, toMin] = data.scheduleTo.split(':').map(Number);
    
    const fromMinutes = fromHour * 60 + fromMin;
    const toMinutes = toHour * 60 + toMin;
    
    return fromMinutes < toMinutes;
  },
  {
    message: 'La hora de inicio debe ser anterior a la hora de fin',
    path: ['scheduleTo'] // El error se muestra en el campo scheduleTo
  }
);

// ==================== TIPOS EXPORTADOS ====================

/**
 * Tipo inferido del schema (valores del formulario)
 */
export type InternalEventFormData = z.infer<typeof internalEventSchema>;

/**
 * Tipo para el payload que se envía al backend (con campos fijos MVP)
 */
export interface InternalEventPayload extends InternalEventFormData {
  /** Evento interno (fijo para MVP) */
  internal: true;
  /** No requiere soporte técnico (fijo para MVP) */
  requiresTech: false;
  /** Buffer antes del evento en minutos (fijo para MVP) */
  bufferBeforeMin: 0;
  /** Buffer después del evento en minutos (fijo para MVP) */
  bufferAfterMin: 0;
  /** Ubicación libre (null cuando se usa spaceId) */
  freeLocation: null;
}

// ==================== DEFAULTS ====================

/**
 * Valores por defecto para inicializar el formulario
 */
export const internalEventDefaults: Partial<InternalEventFormData> = {
  priority: 'MEDIUM',
  audienceType: 'ESTUDIANTES',
  requirements: '',
  coverage: '',
  observations: ''
};

// ==================== HELPERS ====================

/**
 * Convierte datos del formulario a payload del backend
 * Agrega los campos fijos del MVP que no están en el formulario
 * 
 * @param formData - Datos validados del formulario
 * @returns Payload listo para enviar a POST /api/events
 * 
 * @example
 * ```ts
 * const formData = internalEventSchema.parse(rawData);
 * const payload = toInternalEventPayload(formData);
 * const newEvent = await eventsApi.createEvent(payload);
 * ```
 */
export function toInternalEventPayload(
  formData: InternalEventFormData
): InternalEventPayload {
  return {
    ...formData,
    // Campos fijos MVP (no editables en el formulario)
    internal: true,
    requiresTech: false,
    bufferBeforeMin: 0,
    bufferAfterMin: 0,
    freeLocation: null
  };
}

/**
 * Valida los datos del formulario y retorna el payload listo para enviar
 * Lanza error si la validación falla
 * 
 * @param rawData - Datos sin validar del formulario
 * @returns Payload validado y listo para enviar al backend
 * @throws {z.ZodError} Si la validación falla
 * 
 * @example
 * ```ts
 * try {
 *   const payload = validateAndPreparePayload(formData);
 *   const newEvent = await eventsApi.createEvent(payload);
 * } catch (error) {
 *   if (error instanceof z.ZodError) {
 *     console.error('Errores de validación:', error.errors);
 *   }
 * }
 * ```
 */
export function validateAndPreparePayload(
  rawData: unknown
): InternalEventPayload {
  const formData = internalEventSchema.parse(rawData);
  return toInternalEventPayload(formData);
}

/**
 * Valida los datos del formulario de forma segura (sin lanzar error)
 * 
 * @param rawData - Datos sin validar del formulario
 * @returns Resultado de la validación con datos o errores
 * 
 * @example
 * ```ts
 * const result = safeValidatePayload(formData);
 * 
 * if (result.success) {
 *   const payload = result.data;
 *   await eventsApi.createEvent(payload);
 * } else {
 *   console.error('Errores:', result.error.errors);
 * }
 * ```
 */
export function safeValidatePayload(rawData: unknown) {
  const result = internalEventSchema.safeParse(rawData);
  
  if (result.success) {
    return {
      success: true as const,
      data: toInternalEventPayload(result.data)
    };
  }
  
  return {
    success: false as const,
    error: result.error
  };
}
