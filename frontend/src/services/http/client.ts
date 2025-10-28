import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:9090/api",
  timeout: 10000,
});

export async function httpClient<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export { API_BASE_URL };

