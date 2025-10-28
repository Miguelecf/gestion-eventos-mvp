/**
 * ===================================================================
 * VALIDATORS - Helper Functions para Validación
 * ===================================================================
 * Funciones auxiliares para validación con Zod y validaciones custom
 * ===================================================================
 */

import { z } from 'zod';

// ==================== TIPOS ====================

/**
 * Resultado de validación
 */
export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

/**
 * Error de validación detallado
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// ==================== VALIDACIÓN CON ZOD ====================

/**
 * Valida datos con un schema Zod
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }
    
    return {
      success: false,
      errors: formatZodErrors(result.error)
    };
  } catch (error) {
    return {
      success: false,
      errors: [{
        field: '_general',
        message: error instanceof Error ? error.message : 'Error de validación desconocido'
      }]
    };
  }
}

/**
 * Valida y lanza error si falla
 */
export function validateOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  const result = validateWithSchema(schema, data);
  
  if (!result.success) {
    const errorMessages = result.errors!.map(e => `${e.field}: ${e.message}`).join(', ');
    throw new Error(`Errores de validación: ${errorMessages}`);
  }
  
  return result.data!;
}

/**
 * Formatea errores de Zod a formato custom
 */
export function formatZodErrors(zodError: z.ZodError): ValidationError[] {
  return zodError.issues.map(error => ({
    field: error.path.join('.') || '_general',
    message: error.message,
    code: error.code
  }));
}

/**
 * Obtiene el primer error de un campo específico
 */
export function getFieldError(
  errors: ValidationError[],
  fieldName: string
): string | undefined {
  const error = errors.find(e => e.field === fieldName);
  return error?.message;
}

/**
 * Agrupa errores por campo
 */
export function groupErrorsByField(
  errors: ValidationError[]
): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  
  errors.forEach(error => {
    if (!grouped[error.field]) {
      grouped[error.field] = [];
    }
    grouped[error.field].push(error.message);
  });
  
  return grouped;
}

// ==================== VALIDACIONES BÁSICAS ====================

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida teléfono (formato internacional o argentino)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
}

/**
 * Valida URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida fecha ISO string
 */
export function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.includes('T');
}

/**
 * Valida rango de fechas
 */
export function isValidDateRange(
  startDate: string | Date,
  endDate: string | Date
): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return !isNaN(start.getTime()) && 
         !isNaN(end.getTime()) && 
         start < end;
}

// ==================== VALIDACIONES DE NEGOCIO ====================

/**
 * Valida que una fecha no sea en el pasado
 */
export function isNotPastDate(date: string | Date): boolean {
  const targetDate = new Date(date);
  const now = new Date();
  return targetDate >= now;
}

/**
 * Valida que una fecha esté dentro de un rango permitido
 */
export function isDateInRange(
  date: string | Date,
  minDate: string | Date,
  maxDate: string | Date
): boolean {
  const target = new Date(date).getTime();
  const min = new Date(minDate).getTime();
  const max = new Date(maxDate).getTime();
  
  return target >= min && target <= max;
}

/**
 * Valida longitud de string
 */
export function hasValidLength(
  value: string,
  min: number,
  max: number
): boolean {
  const length = value.trim().length;
  return length >= min && length <= max;
}

/**
 * Valida número positivo
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && value > 0 && !isNaN(value);
}

/**
 * Valida número entero
 */
export function isInteger(value: number): boolean {
  return Number.isInteger(value);
}

/**
 * Valida que un array no esté vacío
 */
export function isNonEmptyArray<T>(value: T[]): boolean {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Valida que un objeto no esté vacío
 */
export function isNonEmptyObject(value: object): boolean {
  return typeof value === 'object' && 
         value !== null && 
         Object.keys(value).length > 0;
}

// ==================== SANITIZACIÓN ====================

/**
 * Limpia string (trim y normaliza espacios)
 */
export function sanitizeString(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Normaliza email (lowercase y trim)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normaliza teléfono (remueve caracteres especiales)
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Escapa HTML para prevenir XSS
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  
  return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Remueve caracteres especiales peligrosos
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>{}]/g, '')
    .replace(/\s+/g, ' ');
}

// ==================== VALIDACIÓN DE ARCHIVOS ====================

/**
 * Valida extensión de archivo
 */
export function hasValidExtension(
  filename: string,
  allowedExtensions: string[]
): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? allowedExtensions.includes(ext) : false;
}

/**
 * Valida tamaño de archivo (en bytes)
 */
export function hasValidFileSize(
  sizeInBytes: number,
  maxSizeInMB: number
): boolean {
  const maxBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes <= maxBytes;
}

/**
 * Valida tipo MIME
 */
export function hasValidMimeType(
  mimeType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(mimeType);
}

// ==================== VALIDACIONES COMPUESTAS ====================

/**
 * Valida formulario de evento
 */
export function validateEventForm(data: {
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  estimatedAttendees?: number;
}): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Validar nombre
  if (!hasValidLength(data.name, 3, 200)) {
    errors.push({
      field: 'name',
      message: 'El nombre debe tener entre 3 y 200 caracteres'
    });
  }
  
  // Validar rango de fechas
  if (!isValidDateRange(data.startDate, data.endDate)) {
    errors.push({
      field: 'endDate',
      message: 'La fecha de fin debe ser posterior a la fecha de inicio'
    });
  }
  
  // Validar fecha futura
  if (!isNotPastDate(data.startDate)) {
    errors.push({
      field: 'startDate',
      message: 'La fecha de inicio no puede ser en el pasado'
    });
  }
  
  // Validar asistentes
  if (data.estimatedAttendees !== undefined) {
    if (!isPositiveNumber(data.estimatedAttendees)) {
      errors.push({
        field: 'estimatedAttendees',
        message: 'La cantidad de asistentes debe ser un número positivo'
      });
    }
    
    if (!isInteger(data.estimatedAttendees)) {
      errors.push({
        field: 'estimatedAttendees',
        message: 'La cantidad de asistentes debe ser un número entero'
      });
    }
  }
  
  return {
    success: errors.length === 0,
    data: errors.length === 0 ? data : undefined,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Valida comentario
 */
export function validateComment(body: string): ValidationResult {
  const errors: ValidationError[] = [];
  
  const sanitized = sanitizeString(body);
  
  if (!hasValidLength(sanitized, 1, 1000)) {
    errors.push({
      field: 'body',
      message: 'El comentario debe tener entre 1 y 1000 caracteres'
    });
  }
  
  return {
    success: errors.length === 0,
    data: errors.length === 0 ? { body: sanitized } : undefined,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Valida solicitud pública
 */
export function validatePublicRequest(data: {
  requesterEmail: string;
  requesterPhone?: string;
  eventName: string;
  estimatedAttendees: number;
}): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Validar email
  if (!isValidEmail(data.requesterEmail)) {
    errors.push({
      field: 'requesterEmail',
      message: 'El email no es válido'
    });
  }
  
  // Validar teléfono (si existe)
  if (data.requesterPhone && !isValidPhone(data.requesterPhone)) {
    errors.push({
      field: 'requesterPhone',
      message: 'El teléfono no es válido'
    });
  }
  
  // Validar nombre del evento
  if (!hasValidLength(data.eventName, 3, 200)) {
    errors.push({
      field: 'eventName',
      message: 'El nombre del evento debe tener entre 3 y 200 caracteres'
    });
  }
  
  // Validar asistentes
  if (!isPositiveNumber(data.estimatedAttendees) || !isInteger(data.estimatedAttendees)) {
    errors.push({
      field: 'estimatedAttendees',
      message: 'La cantidad de asistentes debe ser un número entero positivo'
    });
  }
  
  return {
    success: errors.length === 0,
    data: errors.length === 0 ? data : undefined,
    errors: errors.length > 0 ? errors : undefined
  };
}

// ==================== EXPORT DEFAULT ====================

export default {
  // Zod helpers
  validateWithSchema,
  validateOrThrow,
  formatZodErrors,
  getFieldError,
  groupErrorsByField,
  
  // Básicas
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidISODate,
  isValidDateRange,
  
  // Negocio
  isNotPastDate,
  isDateInRange,
  hasValidLength,
  isPositiveNumber,
  isInteger,
  isNonEmptyArray,
  isNonEmptyObject,
  
  // Sanitización
  sanitizeString,
  normalizeEmail,
  normalizePhone,
  escapeHtml,
  sanitizeInput,
  
  // Archivos
  hasValidExtension,
  hasValidFileSize,
  hasValidMimeType,
  
  // Compuestas
  validateEventForm,
  validateComment,
  validatePublicRequest
};
