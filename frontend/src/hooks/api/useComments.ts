/**
 * ===================================================================
 * HOOK DE COMENTARIOS - useComments
 * ===================================================================
 * Hook básico para operaciones CRUD de comentarios
 * Maneja estado de carga y errores de forma centralizada
 * ===================================================================
 */

import { useState, useCallback } from 'react';
import { commentsApi } from '@/services/api/comments.api';
import type { 
  Comment, 
  CreateCommentInput, 
  UpdateCommentInput,
  GetCommentsParams 
} from '@/services/api/comments.api';
import type { PageResponse } from '@/services/api/types/pagination.types';

// ==================== TIPOS DEL HOOK ====================

/**
 * Estado interno del hook
 */
interface UseCommentsState {
  loading: boolean;
  error: string | null;
}

/**
 * Valor de retorno del hook
 */
interface UseCommentsReturn extends UseCommentsState {
  // Operaciones de lectura
  fetchComments: (
    eventId: number, 
    params?: GetCommentsParams
  ) => Promise<PageResponse<Comment> | null>;
  
  fetchCommentById: (
    eventId: number,
    commentId: number
  ) => Promise<Comment | null>;

  fetchAllComments: (
    eventId: number
  ) => Promise<Comment[] | null>;

  fetchCommentsCount: (
    eventId: number
  ) => Promise<number | null>;
  
  // Operaciones de escritura
  createComment: (
    eventId: number, 
    data: CreateCommentInput
  ) => Promise<Comment | null>;
  
  updateComment: (
    eventId: number, 
    commentId: number, 
    data: UpdateCommentInput
  ) => Promise<Comment | null>;
  
  deleteComment: (
    eventId: number, 
    commentId: number
  ) => Promise<boolean>;

  // Utilidades
  validateComment: (body: string) => {
    isValid: boolean;
    error: string | null;
  };
  
  clearError: () => void;
}

// ==================== HOOK PRINCIPAL ====================

/**
 * Hook para gestionar operaciones de comentarios
 * Proporciona funciones para CRUD con manejo de estado integrado
 * 
 * @returns Objeto con funciones y estado del hook
 * 
 * @example
 * function MyComponent() {
 *   const { 
 *     fetchComments, 
 *     createComment, 
 *     loading, 
 *     error 
 *   } = useComments();
 * 
 *   const handleLoadComments = async () => {
 *     const page = await fetchComments(eventId, { page: 0, size: 20 });
 *     if (page) {
 *       setComments(page.content);
 *     }
 *   };
 * 
 *   const handleAddComment = async (body: string) => {
 *     const comment = await createComment(eventId, { body });
 *     if (comment) {
 *       toast.success('Comentario agregado');
 *     }
 *   };
 * 
 *   return (
 *     <div>
 *       {loading && <Spinner />}
 *       {error && <ErrorAlert message={error} />}
 *     </div>
 *   );
 * }
 */
export function useComments(): UseCommentsReturn {
  const [state, setState] = useState<UseCommentsState>({
    loading: false,
    error: null,
  });

  // ==================== OPERACIONES DE LECTURA ====================

  /**
   * Obtiene comentarios paginados de un evento
   */
  const fetchComments = useCallback(
    async (eventId: number, params?: GetCommentsParams) => {
      setState({ loading: true, error: null });
      try {
        const result = await commentsApi.getComments(eventId, params);
        setState({ loading: false, error: null });
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Error al cargar comentarios';
        setState({ loading: false, error: errorMessage });
        return null;
      }
    },
    []
  );

  /**
   * Obtiene un comentario específico por ID
   */
  const fetchCommentById = useCallback(
    async (eventId: number, commentId: number) => {
      setState({ loading: true, error: null });
      try {
        const result = await commentsApi.getCommentById(eventId, commentId);
        setState({ loading: false, error: null });
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Error al cargar comentario';
        setState({ loading: false, error: errorMessage });
        return null;
      }
    },
    []
  );

  /**
   * Obtiene todos los comentarios de un evento (sin paginación)
   */
  const fetchAllComments = useCallback(
    async (eventId: number) => {
      setState({ loading: true, error: null });
      try {
        const result = await commentsApi.getAllComments(eventId);
        setState({ loading: false, error: null });
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Error al cargar comentarios';
        setState({ loading: false, error: errorMessage });
        return null;
      }
    },
    []
  );

  /**
   * Obtiene el conteo total de comentarios
   */
  const fetchCommentsCount = useCallback(
    async (eventId: number) => {
      setState({ loading: true, error: null });
      try {
        const result = await commentsApi.getCommentsCount(eventId);
        setState({ loading: false, error: null });
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Error al obtener conteo';
        setState({ loading: false, error: errorMessage });
        return null;
      }
    },
    []
  );

  // ==================== OPERACIONES DE ESCRITURA ====================

  /**
   * Crea un nuevo comentario
   */
  const createComment = useCallback(
    async (eventId: number, data: CreateCommentInput) => {
      setState({ loading: true, error: null });
      try {
        const result = await commentsApi.createComment(eventId, data);
        setState({ loading: false, error: null });
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Error al crear comentario';
        setState({ loading: false, error: errorMessage });
        return null;
      }
    },
    []
  );

  /**
   * Actualiza un comentario existente
   */
  const updateComment = useCallback(
    async (eventId: number, commentId: number, data: UpdateCommentInput) => {
      setState({ loading: true, error: null });
      try {
        const result = await commentsApi.updateComment(eventId, commentId, data);
        setState({ loading: false, error: null });
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Error al actualizar comentario';
        setState({ loading: false, error: errorMessage });
        return null;
      }
    },
    []
  );

  /**
   * Elimina un comentario
   */
  const deleteComment = useCallback(
    async (eventId: number, commentId: number) => {
      setState({ loading: true, error: null });
      try {
        await commentsApi.deleteComment(eventId, commentId);
        setState({ loading: false, error: null });
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Error al eliminar comentario';
        setState({ loading: false, error: errorMessage });
        return false;
      }
    },
    []
  );

  // ==================== UTILIDADES ====================

  /**
   * Valida el contenido de un comentario sin enviarlo
   */
  const validateComment = useCallback((body: string) => {
    return commentsApi.validateComment(body);
  }, []);

  /**
   * Limpia el error actual
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // ==================== RETORNO ====================

  return {
    ...state,
    fetchComments,
    fetchCommentById,
    fetchAllComments,
    fetchCommentsCount,
    createComment,
    updateComment,
    deleteComment,
    validateComment,
    clearError,
  };
}
