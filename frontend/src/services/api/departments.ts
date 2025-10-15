import { httpClient } from "../http/client";

export function fetchDepartments() {
  return httpClient<unknown[]>("/departments");
}

