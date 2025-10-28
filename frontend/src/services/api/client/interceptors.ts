import type { InternalAxiosRequestConfig, AxiosError } from 'axios';
import type { ApiError } from '../types/api.types';

/**
 * Interceptor de autenticación
 * Agrega el token JWT a todas las requests autenticadas
 */
export const authInterceptor = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  // Obtener token del localStorage (o del store de Zustand)
  const token = localStorage.getItem('auth_token');
  
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
  
  // Construir ApiError desde respuesta del backend
  const apiError: ApiError = {
    message: (data as any)?.message || error.message || 'Error desconocido',
    status,
    code: (data as any)?.code || `HTTP_${status}`,
    details: (data as any)?.details,
    timestamp: (data as any)?.timestamp || new Date().toISOString()
  };

  // Manejo especial de 401 (sesión expirada)
  if (status === 401) {
    // Limpiar token y redirigir a login
    localStorage.removeItem('auth_token');
    
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
    apiError.message = (data as any)?.message || 'El recurso solicitado no existe';
  }

  // Manejo especial de 409 (conflicto)
  if (status === 409) {
    apiError.message = (data as any)?.message || 'Ya existe un recurso con los mismos datos';
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
export const responseLoggingInterceptor = (response: any) => {
  if (import.meta.env.DEV) {
    console.log(`[API Response] ${response.status} ${response.config.url}`, {
      data: response.data
    });
  }
  return response;
};
