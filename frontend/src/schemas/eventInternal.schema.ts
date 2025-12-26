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

/**
 * Enum de Modo de Soporte Técnico (reutiliza tipos del backend)
 */
export const TechSupportModeSchema = z.enum(['SETUP_ONLY', 'ATTENDED']);
export type TechSupportModeType = z.infer<typeof TechSupportModeSchema>;

// ==================== VALIDACIONES CUSTOM ====================

/**
 * Validación de fecha futura (fecha debe ser hoy o posterior)
 * Considera la zona horaria de Argentina
 */
const futureDateValidation = (dateStr: string) => {
  const nowArgentina = getNowInArgentina();
  const [year, month, day] = dateStr.split('-').map(Number);
  const eventDate = new Date(year, month - 1, day);
  const todayArgentina = new Date(nowArgentina.getFullYear(), nowArgentina.getMonth(), nowArgentina.getDate());
  return eventDate >= todayArgentina;
};

/**
 * Obtiene la hora actual en zona horaria de Argentina
 */
const getNowInArgentina = (): Date => {
  const now = new Date();
  const argentinaTimeStr = now.toLocaleString('en-US', { 
    timeZone: 'America/Argentina/Buenos_Aires' 
  });
  return new Date(argentinaTimeStr);
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
 * - date: Fecha del evento (yyyy-MM-dd, hoy o futura)
 * - scheduleFrom: Hora de inicio (HH:mm)
 * - scheduleTo: Hora de fin (HH:mm, debe ser > scheduleFrom)
 * - spaceId o freeLocation: Ubicación del evento (XOR)
 * - contactName: Nombre del contacto
 * - contactEmail: Email del contacto
 * - contactPhone: Teléfono del contacto
 * - requiresTech: Si requiere soporte técnico
 * - bufferBeforeMin: Buffer antes del evento (0-240)
 * - bufferAfterMin: Buffer después del evento (0-240)
 * 
 * Campos opcionales:
 * - audienceType: Tipo de audiencia
 * - requestingArea: Área solicitante
 * - technicalSchedule: Horario técnico (si requiresTech)
 * - techSupportMode: Modo de soporte (si requiresTech)
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
  
  audienceType: AudienceTypeSchema.optional(),
  
  requestingArea: z.string({
    invalid_type_error: 'El área solicitante debe ser texto'
  })
    .max(150, 'El área solicitante no puede superar los 150 caracteres')
    .trim()
    .optional(),
  
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
  
  // ============ UBICACIÓN (XOR: spaceId O freeLocation) ============
  
  spaceId: z.number({
    invalid_type_error: 'Espacio inválido'
  })
    .int('El ID del espacio debe ser un número entero')
    .positive('Debe seleccionar un espacio válido')
    .optional(),
  
  freeLocation: z.string({
    invalid_type_error: 'La ubicación debe ser texto'
  })
    .max(200, 'La ubicación no puede superar los 200 caracteres')
    .trim()
    .optional(),
  
  // ============ BUFFERS ============
  
  bufferBeforeMin: z.number({
    required_error: 'El buffer antes del evento es requerido',
    invalid_type_error: 'El buffer debe ser un número'
  })
    .int('El buffer debe ser un número entero')
    .min(0, 'El buffer mínimo es 0 minutos')
    .max(240, 'El buffer máximo es 240 minutos (4 horas)')
    .default(15),
  
  bufferAfterMin: z.number({
    required_error: 'El buffer después del evento es requerido',
    invalid_type_error: 'El buffer debe ser un número'
  })
    .int('El buffer debe ser un número entero')
    .min(0, 'El buffer mínimo es 0 minutos')
    .max(240, 'El buffer máximo es 240 minutos (4 horas)')
    .default(15),
  
  // ============ SOPORTE TÉCNICO ============
  
  requiresTech: z.boolean({
    required_error: 'Debe indicar si requiere soporte técnico',
    invalid_type_error: 'El valor debe ser verdadero o falso'
  })
    .default(false),
  
  techSupportMode: TechSupportModeSchema.optional(),
  
  technicalSchedule: z.string({
    invalid_type_error: 'El horario técnico debe ser texto'
  })
    .regex(timeFormatRegex, 'El horario técnico debe estar en formato HH:mm (ej: 09:30)')
    .optional(),
  
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
  
  // ============ FLAGS ============
  
  internal: z.boolean().default(true),
  
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
).refine(
  // Validación: El evento debe estar al menos 1 hora en el futuro
  (data) => {
    const nowArgentina = getNowInArgentina();
    const [year, month, day] = data.date.split('-').map(Number);
    const [hour, minute] = data.scheduleFrom.split(':').map(Number);
    const eventDateTime = new Date(year, month - 1, day, hour, minute);
    const minimumAllowedTime = new Date(nowArgentina.getTime() + 60 * 60 * 1000);
    return eventDateTime >= minimumAllowedTime;
  },
  {
    message: 'El evento debe programarse al menos 1 hora después de la hora actual',
    path: ['scheduleFrom']
  }
).refine(
  // =============== VALIDACIÓN XOR: spaceId O freeLocation ===============
  (data) => {
    const hasSpaceId = data.spaceId !== undefined && data.spaceId !== null;
    const hasFreeLocation = data.freeLocation !== undefined && data.freeLocation !== null && data.freeLocation.trim() !== '';
    
    // Exactamente uno debe estar presente (XOR)
    return (hasSpaceId && !hasFreeLocation) || (!hasSpaceId && hasFreeLocation);
  },
  {
    message: 'Debe especificar un espacio físico O una ubicación libre, no ambos',
    path: ['freeLocation']
  }
).refine(
  // =============== VALIDACIÓN: Si requiresTech = true, techSupportMode es requerido ===============
  (data) => {
    if (data.requiresTech) {
      return data.techSupportMode !== undefined && data.techSupportMode !== null;
    }
    return true;
  },
  {
    message: 'Debe especificar el modo de soporte técnico',
    path: ['techSupportMode']
  }
).refine(
  // =============== VALIDACIÓN: technicalSchedule < scheduleFrom (si existe) ===============
  (data) => {
    if (data.technicalSchedule && data.requiresTech) {
      return data.technicalSchedule < data.scheduleFrom;
    }
    return true;
  },
  {
    message: 'El horario técnico debe ser anterior al inicio del evento',
    path: ['technicalSchedule']
  }
);

// ==================== TIPOS EXPORTADOS ====================

/**
 * Tipo inferido del schema (valores del formulario)
 */
export type InternalEventFormData = z.infer<typeof internalEventSchema>;

// ==================== DEFAULTS ====================

/**
 * Valores por defecto para inicializar el formulario
 */
export const internalEventDefaults: Partial<InternalEventFormData> = {
  priority: 'MEDIUM',
  requirements: '',
  coverage: '',
  observations: '',
  bufferBeforeMin: 15,
  bufferAfterMin: 15,
  requiresTech: false,
  internal: true
};

// ==================== HELPERS ====================

/**
 * Convierte datos del formulario a payload del backend
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
): InternalEventFormData {
  return formData;
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
): InternalEventFormData {
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
