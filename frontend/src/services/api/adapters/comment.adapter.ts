/**
 * ===================================================================
 * ADAPTADOR DE COMENTARIOS
 * ===================================================================
 * Transforma BackendCommentDTO ↔ Comment (modelo del frontend)
 * Maneja conversiones de fechas y estructura de autores
 * ===================================================================
 */

import type { 
  BackendCommentDTO, 
  BackendCreateCommentDTO,
  BackendUpdateCommentDTO,
  BackendCommentsPage,
  CommentVisibility 
} from '../types/backend.types';
import type { PageResponse } from '../types/pagination.types';

// ==================== TIPOS DEL FRONTEND ====================

/**
 * Modelo de comentario para el frontend
 */
export interface Comment {
  id: number;
  body: string;
  visibility: CommentVisibility;
  author: {
    id: number;
    username: string;
    fullName: string; // name + lastName combinados
  };
  createdAt: Date; // Convertido a Date para facilitar operaciones
  updatedAt: Date | null;
  isEdited: boolean; // true si updatedAt !== null
}

/**
 * Datos para crear un comentario
 */
export interface CreateCommentInput {
  body: string;
  visibility?: CommentVisibility; // Opcional, por defecto INTERNAL
}

/**
 * Datos para actualizar un comentario
 */
export interface UpdateCommentInput {
  body: string;
}

// ==================== ADAPTADORES PRINCIPALES ====================

/**
 * Adapta BackendCommentDTO (del backend) a Comment (modelo frontend)
 * 
 * @param backendComment - DTO recibido del backend
 * @returns Comment - Modelo normalizado del frontend
 * 
 * @example
 * const backendComment = await fetch('/api/events/123/comments');
 * const comment = adaptCommentFromBackend(backendComment);
 * // comment.author.fullName === 'Juan Pérez'
 * // comment.isEdited === true
 */
export function adaptCommentFromBackend(backendComment: BackendCommentDTO): Comment {
  const createdAt = new Date(backendComment.createdAt);
  const updatedAt = backendComment.updatedAt ? new Date(backendComment.updatedAt) : null;

  return {
    id: backendComment.id,
    body: backendComment.body,
    visibility: backendComment.visibility,
    
    // Autor: combinar datos individuales en objeto estructurado
    author: {
      id: backendComment.authorId,
      username: backendComment.authorUsername,
      fullName: `${backendComment.authorName} ${backendComment.authorLastName}`.trim()
    },

    // Fechas: convertir ISO 8601 strings a Date objects
    createdAt,
    updatedAt,
    
    // Flag de edición: true si las fechas difieren
    isEdited: updatedAt !== null && updatedAt.getTime() !== createdAt.getTime()
  };
}

/**
 * Adapta múltiples comentarios del backend
 * 
 * @param backendComments - Array de DTOs del backend
 * @returns Array de modelos Comment del frontend
 * 
 * @example
 * const page = await fetch('/api/events/123/comments');
 * const comments = adaptCommentsFromBackend(page.comments);
 */
export function adaptCommentsFromBackend(backendComments: BackendCommentDTO[]): Comment[] {
  return backendComments.map(adaptCommentFromBackend);
}

/**
 * Adapta página de comentarios del backend a formato normalizado
 * 
 * @param backendPage - Respuesta de paginación del backend
 * @returns PageResponse con comentarios adaptados
 * 
 * @example
 * const backendPage = await fetch('/api/events/123/comments?page=0');
 * const page = adaptCommentsPageFromBackend(backendPage);
 * // page.content = Comment[]
 * // page.page.number = 0
 */
export function adaptCommentsPageFromBackend(
  backendPage: BackendCommentsPage
): PageResponse<Comment> {
  return {
    content: adaptCommentsFromBackend(backendPage.comments),
    page: backendPage.page,
    first: backendPage.page.number === 0,
    last: backendPage.page.number === backendPage.page.totalPages - 1,
    empty: backendPage.comments.length === 0
  };
}

/**
 * Adapta datos del frontend para crear comentario en backend
 * Transforma CreateCommentInput → BackendCreateCommentDTO
 * 
 * @param input - Datos del formulario de creación
 * @returns DTO listo para enviar al backend (POST /api/events/:id/comments)
 * 
 * @example
 * const formData = {
 *   body: 'Este es un comentario importante',
 *   visibility: 'INTERNAL'
 * };
 * const dto = adaptCommentForCreate(formData);
 * await httpClient.post(`/api/events/${eventId}/comments`, dto);
 */
export function adaptCommentForCreate(input: CreateCommentInput): BackendCreateCommentDTO {
  return {
    body: input.body.trim()
  };
  // Nota: visibility se maneja en el backend según el rol del usuario
}

/**
 * Adapta datos del frontend para actualizar comentario en backend
 * Transforma UpdateCommentInput → BackendUpdateCommentDTO
 * 
 * @param input - Datos del formulario de edición
 * @returns DTO listo para enviar al backend (PATCH /api/events/:id/comments/:commentId)
 * 
 * @example
 * const updates = {
 *   body: 'Comentario actualizado'
 * };
 * const dto = adaptCommentForUpdate(updates);
 * await httpClient.patch(`/api/events/${eventId}/comments/${commentId}`, dto);
 */
export function adaptCommentForUpdate(input: UpdateCommentInput): BackendUpdateCommentDTO {
  return {
    body: input.body.trim()
  };
}

// ==================== HELPERS DE VALIDACIÓN ====================

/**
 * Valida si el usuario actual puede editar un comentario
 * 
 * @param comment - Comentario a validar
 * @param currentUserId - ID del usuario actual
 * @returns true si el usuario puede editar el comentario
 * 
 * @example
 * if (canEditComment(comment, currentUser.id)) {
 *   // mostrar botón de edición
 * }
 */
export function canEditComment(comment: Comment, currentUserId: number): boolean {
  // Solo el autor puede editar su propio comentario
  return comment.author.id === currentUserId;
}

/**
 * Valida si el usuario actual puede eliminar un comentario
 * 
 * @param comment - Comentario a validar
 * @param currentUserId - ID del usuario actual
 * @param isAdmin - true si el usuario es admin
 * @returns true si el usuario puede eliminar el comentario
 * 
 * @example
 * if (canDeleteComment(comment, currentUser.id, currentUser.isAdmin)) {
 *   // mostrar botón de eliminar
 * }
 */
export function canDeleteComment(
  comment: Comment, 
  currentUserId: number, 
  isAdmin: boolean
): boolean {
  // El autor o un admin pueden eliminar
  return comment.author.id === currentUserId || isAdmin;
}

/**
 * Valida si un comentario es público (visible para todos)
 * 
 * @param comment - Comentario a validar
 * @returns true si el comentario es público
 * 
 * @example
 * if (isPublicComment(comment)) {
 *   return <Badge>Público</Badge>;
 * }
 */
export function isPublicComment(comment: Comment): boolean {
  return comment.visibility === 'PUBLIC';
}

/**
 * Obtiene el tiempo relativo desde la creación del comentario
 * 
 * @param comment - Comentario
 * @returns String con tiempo relativo (ej: "hace 2 horas")
 * 
 * @example
 * <span>{getCommentAge(comment)}</span>
 * // "hace 2 horas"
 */
export function getCommentAge(comment: Comment): string {
  const now = new Date();
  const diffMs = now.getTime() - comment.createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  
  // Más de 7 días: mostrar fecha
  return comment.createdAt.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Obtiene el badge CSS para la visibilidad del comentario
 * 
 * @param visibility - Visibilidad del comentario
 * @returns Clase CSS de color
 * 
 * @example
 * <Badge className={getCommentVisibilityColor(comment.visibility)}>
 *   {comment.visibility}
 * </Badge>
 */
export function getCommentVisibilityColor(visibility: CommentVisibility): string {
  const colorMap: Record<CommentVisibility, string> = {
    INTERNAL: 'bg-gray-100 text-gray-800',
    PUBLIC: 'bg-blue-100 text-blue-800'
  };

  return colorMap[visibility] || 'bg-gray-100 text-gray-800';
}

/**
 * Valida si el cuerpo del comentario es válido
 * 
 * @param body - Texto del comentario
 * @returns Objeto con validación y mensaje de error
 * 
 * @example
 * const validation = validateCommentBody(formData.body);
 * if (!validation.isValid) {
 *   setError(validation.error);
 * }
 */
export function validateCommentBody(body: string): { 
  isValid: boolean; 
  error: string | null 
} {
  const trimmed = body.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'El comentario no puede estar vacío'
    };
  }

  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: 'El comentario debe tener al menos 3 caracteres'
    };
  }

  if (trimmed.length > 2000) {
    return {
      isValid: false,
      error: 'El comentario no puede exceder 2000 caracteres'
    };
  }

  return {
    isValid: true,
    error: null
  };
}
