import type { Event } from "../../models/event";
import { httpClient } from "../../lib/http";

/**
 * Obtiene todos los eventos activos
 */
export async function fetchEvents(): Promise<Event[]> {
  const response = await httpClient.get<Event[]>("/api/events");
  return response.data;
}

/**
 * Obtiene un evento por ID
 */
export async function fetchEventById(eventId: string): Promise<Event> {
  const response = await httpClient.get<Event>(`/api/events/${eventId}`);
  return response.data;
}

/**
 * Obtiene eventos de una fecha específica
 * @param date - Fecha en formato YYYY-MM-DD (ej: 2025-12-19)
 */
export async function fetchEventsByDate(date: string): Promise<Event[]> {
  const response = await httpClient.get<Event[]>(`/api/events/date`, {
    params: { date }
  });
  return response.data;
}

/**
 * Crea un nuevo evento
 */
export async function createEvent(payload: Partial<Event>): Promise<Event> {
  const response = await httpClient.post<Event>("/api/events", payload);
  return response.data;
}

