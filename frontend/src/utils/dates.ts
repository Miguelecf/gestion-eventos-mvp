export function formatDate(date: string | Date, locale = "es-AR") {
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toLocaleDateString(locale);
}

