import { format, parse, parseISO } from 'date-fns';

/**
 * Convierte Date a string yyyy-MM-dd sin issues de zona horaria
 * Usa la fecha local del navegador
 */
export function toBackendDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Convierte string yyyy-MM-dd a Date (asume local timezone)
 * Evita off-by-one errors causados por UTC conversions
 */
export function fromBackendDate(dateStr: string): Date {
  return parse(dateStr, 'yyyy-MM-dd', new Date());
}

/**
 * Convierte string HH:mm a objeto Time
 */
export function fromBackendTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

/**
 * Convierte objeto Time a string HH:mm
 */
export function toBackendTime(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Parsea timestamp ISO 8601 del backend (incluye zona horaria)
 */
export function fromBackendTimestamp(timestamp: string): Date {
  return parseISO(timestamp);
}

/**
 * Convierte Date a timestamp ISO 8601 para el backend
 */
export function toBackendTimestamp(date: Date): string {
  return date.toISOString();
}

/**
 * Formatea fecha para display en UI (dd/MM/yyyy)
 */
export function formatDisplayDate(date: Date): string {
  return format(date, 'dd/MM/yyyy');
}

/**
 * Formatea hora para display en UI (HH:mm)
 */
export function formatDisplayTime(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Formatea timestamp completo para display (dd/MM/yyyy HH:mm)
 */
export function formatDisplayTimestamp(date: Date): string {
  return format(date, 'dd/MM/yyyy HH:mm');
}

/**
 * Combina fecha y hora en un solo Date object
 */
export function combineDateAndTime(date: Date, hours: number, minutes: number): Date {
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}

/**
 * Valida que una fecha no esté en el pasado
 */
export function isNotPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

/**
 * Valida que una fecha esté en un rango válido
 */
export function isDateInRange(date: Date, minDate?: Date, maxDate?: Date): boolean {
  if (minDate && date < minDate) return false;
  if (maxDate && date > maxDate) return false;
  return true;
}
