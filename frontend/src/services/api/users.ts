import { httpClient } from "../http/client";

export function fetchUsers() {
  return httpClient<unknown[]>("/users");
}

