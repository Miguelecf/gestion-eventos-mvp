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

