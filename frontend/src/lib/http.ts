import axios, { type AxiosRequestConfig} from "axios";

// Configuración base de axios con URL correcta del backend
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:9090",
    withCredentials: false,
    timeout: 30000,
});

// Persistencia simple en localStorage (con cache en memoria para tolerancia a clear())
const TOKENS_KEY = "auth.tokens";

export type Tokens = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  expiresAt?: string; // ISO opcional
};

// Cache en memoria para evitar estados inconsistentes si localStorage se manipula
let currentTokens: Tokens | null = null;

export function getStoredTokens(): Tokens | null {
  // primero intenta cache en memoria
  if (currentTokens) return currentTokens;
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    currentTokens = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredTokens(tokens: Tokens | null) {
  try {
    currentTokens = tokens;
    if (!tokens) {
      localStorage.removeItem(TOKENS_KEY);
    } else {
      localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
    }
  } catch (error) {
    // Puedes loguear el error para diagnóstico, pero no interrumpas el flujo
    if (import.meta.env.MODE === "development") {
      console.error("Error al guardar tokens en localStorage:", error);
    }
  }
}

export function clearStoredTokens() {
  setStoredTokens(null);
}

export function getAccessToken(): string | null {
  return getStoredTokens()?.accessToken ?? null;
}

//Normalizando la respuesta del backend a Tokens (Añadiendo expiresAt)
export function normalizeTokensFromResponse(resp: any): Tokens {
  const expiresIn = typeof resp?.expiresIn === "number" ? resp.expiresIn : undefined;
  const expiresAt = typeof expiresIn === "number" ? new Date(Date.now() + expiresIn * 1000).toISOString() : undefined;

  return {
    accessToken: resp.accessToken,
    refreshToken: resp.refreshToken,
    expiresIn,
    expiresAt,
  };
}


// Inserta Authorization si hay accessToken
api.interceptors.request.use((config) => {
    const tokens = getStoredTokens();
    if (tokens?.accessToken) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${tokens.accessToken}`;
    }
    return config;
});

// Refresh automático en 401 (si hay refreshToken)
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function processQueue(newAccess: string | null) {
    pendingQueue.forEach((cb) => cb(newAccess));
    pendingQueue = [];
}

async function doRefresh(currentRefresh: string): Promise<Tokens> {
  // usa axios crudo para no caer en el interceptor de esta misma instancia
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:9090";
  const { data } = await axios.post(`${baseURL}/auth/refresh`, {
    refreshToken: currentRefresh,
  }, { withCredentials: false });
  return normalizeTokensFromResponse(data);
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original?._retry) {
      const tokens = getStoredTokens();
      if (!tokens?.refreshToken) return Promise.reject(error);

      if (isRefreshing) {
        // Cola: espera hasta que termine el refresh en curso
        return new Promise((resolve, reject) => {
          pendingQueue.push((newAccess) => {
            if (!newAccess) return reject(error);
            original.headers = original.headers || {};
            (original.headers as any)["Authorization"] = `Bearer ${newAccess}`;
            resolve(api(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;
      try {
        const newTokens = await doRefresh(tokens.refreshToken);
        // guarda tokens normalizados (contienen expiresAt)
        setStoredTokens(newTokens);
        processQueue(newTokens.accessToken ?? null);
        original.headers = original.headers || {};
        (original.headers as any)["Authorization"] = `Bearer ${newTokens.accessToken}`;
        return api(original);
      } catch (err) {
        setStoredTokens(null);
        processQueue(null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;