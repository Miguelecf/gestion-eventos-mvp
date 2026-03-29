import type { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import type { ApiError } from '../types/api.types';

type BackendErrorPayload = {
  message?: string;
  code?: string;
  error?: string;
  timestamp?: string;
  isAvailable?: boolean;
  conflicts?: unknown;
} & Record<string, unknown>;

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toBackendErrorPayload = (value: unknown): BackendErrorPayload | null =>
  isObjectRecord(value) ? (value as BackendErrorPayload) : null;

/**
 * Interceptor de autenticación
 * Agrega el token JWT a todas las requests autenticadas
 * ✅ SINCRONIZADO: Lee 'accessToken' de localStorage
 */
export const authInterceptor = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  // ✅ Leer 'accessToken' (key consistente)
  const token = localStorage.getItem('accessToken');
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
};

/**
 * Interceptor de errores
 * Normaliza todos los errores HTTP a formato ApiError consistente
 */
export const errorInterceptor = async (error: AxiosError): Promise<never> => {
  // Error de red (sin respuesta del servidor)
  if (!error.response) {
    const apiError: ApiError = {
      message: error.message || 'Error de conexión. Verifica tu red.',
      status: 0,
      code: error.code === 'ECONNABORTED' ? 'TIMEOUT' : 'NETWORK_ERROR',
      timestamp: new Date().toISOString()
    };
    return Promise.reject(apiError);
  }

  // Error HTTP con respuesta del servidor
  const { status, data } = error.response;
  const payload = toBackendErrorPayload(data);
  
  // Construir ApiError desde respuesta del backend
  const apiError: ApiError = {
    message: payload?.message || error.message || 'Error desconocido',
    status,
    code: payload?.code || payload?.error || payload?.message || `HTTP_${status}`,
    details: isObjectRecord(data) ? data : undefined,
    timestamp: payload?.timestamp || new Date().toISOString()
  };

  // Manejo especial de 401 (sesión expirada)
  if (status === 401) {
    // ✅ Limpiar 'accessToken' y 'refreshToken'
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Evitar redirección si ya estamos en login o en ruta pública
    if (!window.location.pathname.includes('/login') && 
        !window.location.pathname.includes('/public')) {
      window.location.href = '/login?sessionExpired=true';
    }
  }

  // Manejo especial de 403 (sin permisos)
  if (status === 403) {
    apiError.message = 'No tienes permisos para realizar esta acción';
  }

  // Manejo especial de 404
  if (status === 404) {
    apiError.message = payload?.message || 'El recurso solicitado no existe';
  }

  // Manejo especial de 409 (conflicto)
  if (status === 409) {
    apiError.message = payload?.message || 'Ya existe un recurso con los mismos datos';
    
    // ⚠️ IMPORTANTE: Preservar datos originales del backend para conflictos de disponibilidad
    // Si el backend retorna AvailabilityConflictResponse (con isAvailable, conflicts, etc.),
    // lo agregamos al ApiError para que pueda ser extraído posteriormente
    if (payload?.isAvailable !== undefined && payload.conflicts !== undefined) {
      apiError.details = data as Record<string, any>;
    }
  }

  return Promise.reject(apiError);
};

/**
 * Interceptor de requests para logging (solo en desarrollo)
 */
export const requestLoggingInterceptor = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  if (import.meta.env.DEV) {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data
    });
  }
  return config;
};

/**
 * Interceptor de responses para logging (solo en desarrollo)
 */
export const responseLoggingInterceptor = (
  response: AxiosResponse<unknown>
): AxiosResponse<unknown> => {
  if (import.meta.env.DEV) {
    console.log(`[API Response] ${response.status} ${response.config.url}`, {
      data: response.data
    });
  }
  return response;
};
