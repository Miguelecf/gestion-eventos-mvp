import type { Event } from "../../models/event";
import { httpClient } from "../http/client";

export function fetchEvents() {
  return httpClient<Event[]>("/events");
}

export function fetchEventById(eventId: string) {
  return httpClient<Event>(`/events/${eventId}`);
}

export function createEvent(payload: Partial<Event>) {
  return httpClient<Event>("/events", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
}

