/**
 * ===================================================================
 * ERROR HANDLER - Manejo Centralizado de Errores
 * ===================================================================
 * Utilidades para manejo, formateo y clasificación de errores
 * ===================================================================
 */

import type { AxiosError } from 'axios';
import type { ValidationError } from './validators';

// ==================== TIPOS ====================

/**
 * Tipo de error de API
 */
export type ApiErrorType =
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Error de API estructurado
 */
export interface ApiError {
  type: ApiErrorType;
  message: string;
  statusCode?: number;
  details?: any;
  timestamp: string;
}

/**
 * Opciones para formateo de error
 */
export interface ErrorFormatOptions {
  includeStack?: boolean;
  userFriendly?: boolean;
}

// ==================== TYPE GUARDS ====================

/**
 * Verifica si es error de Axios
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as any).isAxiosError === true
  );
}

/**
 * Verifica si es error de validación
 */
export function isValidationError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    return 'type' in error && (error as ApiError).type === 'VALIDATION_ERROR';
  }
  return false;
}

/**
 * Verifica si es error de red
 */
export function isNetworkError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return !error.response && error.message === 'Network Error';
  }
  if (typeof error === 'object' && error !== null) {
    return 'type' in error && (error as ApiError).type === 'NETWORK_ERROR';
  }
  return false;
}

/**
 * Verifica si es error de autenticación
 */
export function isAuthError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return error.response?.status === 401 || error.response?.status === 403;
  }
  if (typeof error === 'object' && error !== null) {
    return 'type' in error && (error as ApiError).type === 'AUTH_ERROR';
  }
  return false;
}

/**
 * Verifica si es error 404
 */
export function isNotFoundError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return error.response?.status === 404;
  }
  if (typeof error === 'object' && error !== null) {
    return 'type' in error && (error as ApiError).type === 'NOT_FOUND';
  }
  return false;
}

/**
 * Verifica si es error de conflicto
 */
export function isConflictError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return error.response?.status === 409;
  }
  if (typeof error === 'object' && error !== null) {
    return 'type' in error && (error as ApiError).type === 'CONFLICT';
  }
  return false;
}

/**
 * Verifica si es error de servidor (5xx)
 */
export function isServerError(error: unknown): boolean {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    return status !== undefined && status >= 500 && status < 600;
  }
  if (typeof error === 'object' && error !== null) {
    return 'type' in error && (error as ApiError).type === 'SERVER_ERROR';
  }
  return false;
}

// ==================== CLASIFICACIÓN DE ERRORES ====================

/**
 * Clasifica el tipo de error
 */
export function classifyError(error: unknown): ApiErrorType {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    
    if (!error.response) {
      return 'NETWORK_ERROR';
    }
    
    switch (status) {
      case 400:
        return 'VALIDATION_ERROR';
      case 401:
      case 403:
        return 'AUTH_ERROR';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'SERVER_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
  }
  
  if (isValidationError(error)) {
    return 'VALIDATION_ERROR';
  }
  
  return 'UNKNOWN_ERROR';
}

// ==================== MANEJO DE ERRORES ====================

/**
 * Maneja errores de API y retorna error estructurado
 */
export function handleApiError(error: unknown): ApiError {
  const timestamp = new Date().toISOString();
  
  // Error de Axios
  if (isAxiosError(error)) {
    const type = classifyError(error);
    const statusCode = error.response?.status;
    const message = extractErrorMessage(error);
    const details = error.response?.data;
    
    return {
      type,
      message,
      statusCode,
      details,
      timestamp
    };
  }
  
  // Error genérico
  if (error instanceof Error) {
    return {
      type: 'UNKNOWN_ERROR',
      message: error.message,
      timestamp
    };
  }
  
  // Error desconocido
  return {
    type: 'UNKNOWN_ERROR',
    message: 'Ha ocurrido un error desconocido',
    timestamp
  };
}

/**
 * Extrae mensaje de error de respuesta de Axios
 */
export function extractErrorMessage(error: AxiosError): string {
  // Mensaje del backend
  if (error.response?.data) {
    const data = error.response.data as any;
    
    // Spring Boot format
    if (data.message) return data.message;
    if (data.error) return data.error;
    
    // Validation errors
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.map((e: any) => e.message || e).join(', ');
    }
    
    // String directo
    if (typeof data === 'string') return data;
  }
  
  // Mensaje por defecto según status
  const status = error.response?.status;
  
  switch (status) {
    case 400:
      return 'Datos inválidos. Verifica los campos e intenta nuevamente.';
    case 401:
      return 'No estás autenticado. Por favor inicia sesión.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'El recurso solicitado no fue encontrado.';
    case 409:
      return 'Conflicto con el estado actual del recurso.';
    case 500:
      return 'Error interno del servidor. Intenta más tarde.';
    case 502:
      return 'Servicio temporalmente no disponible.';
    case 503:
      return 'Servicio en mantenimiento. Intenta más tarde.';
    default:
      return error.message || 'Ha ocurrido un error inesperado.';
  }
}

// ==================== FORMATEO DE ERRORES ====================

/**
 * Formatea error para mostrar al usuario
 */
export function formatErrorMessage(
  error: unknown,
  options: ErrorFormatOptions = {}
): string {
  const { userFriendly = true } = options;
  
  const apiError = handleApiError(error);
  
  if (userFriendly) {
    return getUserFriendlyMessage(apiError);
  }
  
  return apiError.message;
}

/**
 * Obtiene mensaje user-friendly según tipo de error
 */
export function getUserFriendlyMessage(error: ApiError): string {
  switch (error.type) {
    case 'VALIDATION_ERROR':
      return '❌ Los datos ingresados no son válidos. Por favor verifica los campos marcados.';
    
    case 'NETWORK_ERROR':
      return '🌐 Sin conexión a internet. Verifica tu conexión e intenta nuevamente.';
    
    case 'AUTH_ERROR':
      return '🔒 Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
    
    case 'NOT_FOUND':
      return '🔍 El recurso que buscas no existe o fue eliminado.';
    
    case 'CONFLICT':
      return '⚠️ Existe un conflicto con el estado actual. Por favor refresca la página e intenta nuevamente.';
    
    case 'SERVER_ERROR':
      return '🔧 Estamos experimentando problemas técnicos. Intenta más tarde.';
    
    default:
      return error.message || '❓ Ha ocurrido un error inesperado. Intenta nuevamente.';
  }
}

/**
 * Formatea errores de validación para formularios
 */
export function formatValidationErrors(
  errors: ValidationError[]
): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  errors.forEach(error => {
    formatted[error.field] = error.message;
  });
  
  return formatted;
}

/**
 * Formatea error como lista de mensajes
 */
export function formatErrorList(error: unknown): string[] {
  const apiError = handleApiError(error);
  
  // Si hay detalles de validación
  if (apiError.details && Array.isArray(apiError.details)) {
    return apiError.details.map((e: any) => e.message || String(e));
  }
  
  // Mensaje único
  return [apiError.message];
}

// ==================== LOGGING ====================

/**
 * Registra error en consola (desarrollo)
 */
export function logError(error: unknown, context?: string): void {
  if (import.meta.env.DEV) {
    console.group(`🔴 Error${context ? ` en ${context}` : ''}`);
    console.error(error);
    
    if (isAxiosError(error)) {
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
      console.log('Config:', error.config);
    }
    
    console.groupEnd();
  }
}

/**
 * Registra error crítico (siempre)
 */
export function logCriticalError(error: unknown, context?: string): void {
  console.error(`🚨 Critical Error${context ? ` en ${context}` : ''}:`, error);
}

// ==================== UTILIDADES ====================

/**
 * Reintentar operación con backoff exponencial
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // No reintentar errores de validación o auth
      if (isValidationError(error) || isAuthError(error)) {
        throw error;
      }
      
      // Esperar antes de reintentar
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Maneja errores async/await de forma segura
 */
export async function safeAsync<T>(
  promise: Promise<T>
): Promise<[T | null, ApiError | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, handleApiError(error)];
  }
}

/**
 * Crea error personalizado
 */
export function createApiError(
  type: ApiErrorType,
  message: string,
  statusCode?: number,
  details?: any
): ApiError {
  return {
    type,
    message,
    statusCode,
    details,
    timestamp: new Date().toISOString()
  };
}

// ==================== EXPORT DEFAULT ====================

export default {
  // Type Guards
  isAxiosError,
  isValidationError,
  isNetworkError,
  isAuthError,
  isNotFoundError,
  isConflictError,
  isServerError,
  
  // Clasificación
  classifyError,
  
  // Manejo
  handleApiError,
  extractErrorMessage,
  
  // Formateo
  formatErrorMessage,
  getUserFriendlyMessage,
  formatValidationErrors,
  formatErrorList,
  
  // Logging
  logError,
  logCriticalError,
  
  // Utilidades
  retryWithBackoff,
  safeAsync,
  createApiError
};
