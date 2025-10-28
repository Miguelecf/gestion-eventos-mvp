/**
 * Error estándar de la API
 * Normalización de errores HTTP para el frontend
 */
export interface ApiError {
  message: string;
  status: number;
  code: string;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * Respuesta genérica con datos
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * Respuesta sin contenido (204 No Content)
 */
export type NoContentResponse = void;

/**
 * Estado de operación genérica
 */
export interface OperationResult {
  success: boolean;
  message?: string;
}

/**
 * Tipo helper para respuestas de creación con ID
 */
export interface CreatedResponse {
  id: number;
  message?: string;
}

/**
 * Tipo helper para respuestas de actualización
 */
export interface UpdatedResponse {
  updated: boolean;
  message?: string;
}

/**
 * Tipo helper para respuestas de eliminación
 */
export interface DeletedResponse {
  deleted: boolean;
  message?: string;
}
