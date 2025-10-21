import { httpClient } from "../http/client";

export function fetchSpaces() {
  return httpClient<unknown[]>("/spaces");
}

