/**
 * ===================================================================
 * HOOK ESPECIALIZADO - useEventComments
 * ===================================================================
 * Hook de alto nivel para gestionar comentarios en la página de detalle
 * Maneja estado local de la lista, paginación y operaciones CRUD
 * ===================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { commentsApi } from '@/services/api/comments.api';
import type { Comment, GetCommentsParams } from '@/services/api/comments.api';
import type { PageResponse } from '@/services/api/types/pagination.types';

// ==================== TIPOS DEL HOOK ====================

/**
 * Estado interno del hook
 */
interface UseEventCommentsState {
  comments: Comment[];
  pageInfo: PageResponse<Comment> | null;
  loading: boolean;
  error: string | null;
  submitting: boolean;
}

/**
 * Valor de retorno del hook
 */
interface UseEventCommentsReturn extends UseEventCommentsState {
  loadComments: (page?: number) => Promise<void>;
  addComment: (body: string) => Promise<boolean>;
  updateComment: (commentId: number, body: string) => Promise<boolean>;
  deleteComment: (commentId: number) => Promise<boolean>;
  loadMoreComments: () => Promise<void>;
  refreshComments: () => Promise<void>;
  hasMore: boolean;
}

// ==================== HOOK PRINCIPAL ====================

/**
 * Hook especializado para gestionar comentarios en la página de detalle del evento
 * 
 * Características:
 * - Carga automática al montar el componente
 * - Gestión de paginación infinita
 * - Optimistic updates en el estado local
 * - Manejo de errores específico
 * 
 * @param eventId - ID del evento
 * @param options - Opciones de configuración
 * @returns Objeto con comentarios y funciones de gestión
 * 
 * @example
 * function EventDetailPage() {
 *   const { id } = useParams();
 *   const {
 *     comments,
 *     loading,
 *     addComment,
 *     loadMoreComments,
 *     hasMore
 *   } = useEventComments(parseInt(id));
 * 
 *   return (
 *     <div>
 *       <CommentsList comments={comments} />
 *       <CommentForm onSubmit={addComment} />
 *       {hasMore && (
 *         <Button onClick={loadMoreComments}>
 *           Cargar más
 *         </Button>
 *       )}
 *     </div>
 *   );
 * }
 */
export function useEventComments(
  eventId: number,
  options: {
    pageSize?: number;
    sortOrder?: 'ASC' | 'DESC';
    autoLoad?: boolean;
  } = {}
): UseEventCommentsReturn {
  const {
    pageSize = 20,
    sortOrder = 'DESC', // Más recientes primero por defecto
    autoLoad = true,
  } = options;

  const [state, setState] = useState<UseEventCommentsState>({
    comments: [],
    pageInfo: null,
    loading: false,
    error: null,
    submitting: false,
  });

  // ==================== CARGA DE COMENTARIOS ====================

  /**
   * Carga comentarios con paginación
   * @param page - Número de página (0-indexed)
   */
  const loadComments = useCallback(
    async (page: number = 0) => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const params: GetCommentsParams = {
          page,
          size: pageSize,
        };

        const result = await commentsApi.getComments(eventId, params);

        setState(prev => ({
          ...prev,
          comments: page === 0 
            ? result.content 
            : [...prev.comments, ...result.content],
          pageInfo: result,
          loading: false,
        }));
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Error al cargar comentarios';
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      }
    },
    [eventId, pageSize]
  );

  /**
   * Recarga los comentarios desde la primera página
   */
  const refreshComments = useCallback(async () => {
    await loadComments(0);
  }, [loadComments]);

  /**
   * Carga la siguiente página de comentarios
   */
  const loadMoreComments = useCallback(async () => {
    if (!state.pageInfo || state.pageInfo.last || state.loading) {
      return;
    }
    
    await loadComments(state.pageInfo.page.number + 1);
  }, [state.pageInfo, state.loading, loadComments]);

  // ==================== OPERACIONES CRUD ====================

  /**
   * Agrega un nuevo comentario
   * Implementa optimistic update: agrega el comentario localmente antes de confirmar
   * 
   * @param body - Contenido del comentario
   * @returns true si se agregó correctamente
   */
  const addComment = useCallback(
    async (body: string): Promise<boolean> => {
      if (!body.trim()) return false;

      setState(prev => ({ ...prev, submitting: true, error: null }));

      try {
        const newComment = await commentsApi.createComment(eventId, { body });
        
        // Insertar al inicio de la lista (más reciente primero)
        setState(prev => ({
          ...prev,
          comments: [newComment, ...prev.comments],
          submitting: false,
        }));

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Error al crear comentario';
        
        setState(prev => ({
          ...prev,
          submitting: false,
          error: errorMessage,
        }));
        
        return false;
      }
    },
    [eventId]
  );

  /**
   * Actualiza un comentario existente
   * Implementa optimistic update local
   * 
   * @param commentId - ID del comentario
   * @param body - Nuevo contenido
   * @returns true si se actualizó correctamente
   */
  const updateComment = useCallback(
    async (commentId: number, body: string): Promise<boolean> => {
      if (!body.trim()) return false;

      setState(prev => ({ ...prev, submitting: true, error: null }));

      try {
        const updated = await commentsApi.updateComment(eventId, commentId, { body });
        
        // Actualizar en la lista local
        setState(prev => ({
          ...prev,
          comments: prev.comments.map(c => 
            c.id === commentId ? updated : c
          ),
          submitting: false,
        }));

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Error al actualizar comentario';
        
        setState(prev => ({
          ...prev,
          submitting: false,
          error: errorMessage,
        }));
        
        return false;
      }
    },
    [eventId]
  );

  /**
   * Elimina un comentario
   * Implementa optimistic update: remueve localmente antes de confirmar
   * 
   * @param commentId - ID del comentario a eliminar
   * @returns true si se eliminó correctamente
   */
  const deleteComment = useCallback(
    async (commentId: number): Promise<boolean> => {
      setState(prev => ({ ...prev, submitting: true, error: null }));

      try {
        await commentsApi.deleteComment(eventId, commentId);
        
        // Remover de la lista local
        setState(prev => ({
          ...prev,
          comments: prev.comments.filter(c => c.id !== commentId),
          submitting: false,
        }));

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Error al eliminar comentario';
        
        setState(prev => ({
          ...prev,
          submitting: false,
          error: errorMessage,
        }));
        
        return false;
      }
    },
    [eventId]
  );

  // ==================== EFECTOS ====================

  /**
   * Carga inicial de comentarios
   */
  useEffect(() => {
    if (autoLoad) {
      loadComments(0);
    }
  }, [autoLoad, loadComments]);

  // ==================== COMPUTED VALUES ====================

  const hasMore = state.pageInfo ? !state.pageInfo.last : false;

  // ==================== RETORNO ====================

  return {
    ...state,
    loadComments,
    addComment,
    updateComment,
    deleteComment,
    loadMoreComments,
    refreshComments,
    hasMore,
  };
}
