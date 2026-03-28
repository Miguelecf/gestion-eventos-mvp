export function formatDate(date: string | Date, locale = "es-AR") {
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toLocaleDateString(locale);
}

/**
 * Parsea una fecha en formato "YYYY-MM-DD" como fecha local (sin ajuste de zona horaria).
 * 
 * @param dateString - Fecha en formato "YYYY-MM-DD" (ej: "2025-12-29")
 * @returns Objeto Date con la fecha local correcta
 * 
 * @example
 * parseLocalDate("2025-12-29") // 29 de diciembre de 2025 (sin importar la zona horaria)
 */
export function parseLocalDate(dateString: string): Date {
  // Agregar 'T00:00:00' fuerza la interpretación como hora local en lugar de UTC
  return new Date(dateString + 'T00:00:00');
}

/**
 * Formatea una fecha en formato "YYYY-MM-DD" como texto legible en español.
 * Maneja correctamente la zona horaria para evitar mostrar el día anterior.
 * 
 * @param dateString - Fecha en formato "YYYY-MM-DD" (ej: "2025-12-29")
 * @param options - Opciones de formato (weekday, year, month, day)
 * @returns Fecha formateada (ej: "domingo, 29 de diciembre de 2025")
 */
export function formatLocalDate(
  dateString: string, 
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
): string {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('es-AR', options);
}

/**
 * Formatea una fecha local "YYYY-MM-DD" en formato numérico corto.
 *
 * @example
 * formatShortLocalDate("2026-03-28") // "28/03/2026"
 */
export function formatShortLocalDate(dateString: string): string {
  return formatLocalDate(dateString, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Devuelve una clave numérica estable para ordenar por fecha y hora reales.
 * Usa la fecha local del evento y la combina con el horario indicado.
 */
export function getLocalDateTimeSortValue(
  dateString: string,
  timeString: string = '00:00'
): number {
  const date = parseLocalDate(dateString);
  const [hours = 0, minutes = 0] = timeString.split(':').map(Number);

  date.setHours(hours, minutes, 0, 0);

  return date.getTime();
}

