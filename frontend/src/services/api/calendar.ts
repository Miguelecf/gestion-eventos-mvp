import { httpClient } from "../http/client";

export function fetchCalendar() {
  return httpClient<unknown>("/calendar");
}

