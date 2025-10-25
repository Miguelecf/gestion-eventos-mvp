/**
 * ===================================================================
 * COMMENTS STORE - Integración con SDK
 * ===================================================================
 * Store de Zustand que integra commentsApi SDK para gestión de comentarios
 * ===================================================================
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import {
  commentsApi,
  type GetCommentsParams,
  handleApiError,
  logError
} from '@/services/api';
import type {
  Comment,
  CreateCommentInput,
  UpdateCommentInput
} from '@/services/api/adapters';
import type { PageResponse } from '@/services/api/types';

// ==================== TIPOS ====================

/**
 * Resultado de validación de comentario
 */
export interface CommentValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Reacciones rápidas para comentarios
 */
export type QuickReaction = 'approved' | 'needs_revision' | 'rejected';

/**
 * Estado de carga async
 */
export interface CommentsLoadingState {
  comments: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

/**
 * Estado de errores
 */
export interface CommentsErrorState {
  comments: string | null;
  create: string | null;
  update: string | null;
  delete: string | null;
}

/**
 * Store completo de comentarios
 */
export interface CommentsStore {
  // ==================== DATOS ====================
  
  /**
   * Comentarios por evento
   */
  commentsByEvent: Record<number, Comment[]>;
  
  /**
   * Paginación por evento
   */
  paginationByEvent: Record<number, {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  }>;
  
  /**
   * Comentario en edición
   */
  editingComment: Comment | null;
  
  // ==================== ESTADO ASYNC ====================
  
  /**
   * Estados de carga
   */
  loading: CommentsLoadingState;
  
  /**
   * Errores
   */
  errors: CommentsErrorState;
  
  // ==================== ACCIONES SDK ====================
  
  /**
   * Obtener comentarios de un evento
   */
  fetchComments: (eventId: number, params?: GetCommentsParams) => Promise<void>;
  
  /**
   * Obtener comentario por ID
   */
  fetchCommentById: (eventId: number, commentId: number) => Promise<Comment | null>;
  
  /**
   * Crear nuevo comentario
   */
  createComment: (eventId: number, input: CreateCommentInput) => Promise<Comment | null>;
  
  /**
   * Actualizar comentario existente
   */
  updateComment: (eventId: number, commentId: number, input: UpdateCommentInput) => Promise<Comment | null>;
  
  /**
   * Eliminar comentario
   */
  deleteComment: (eventId: number, commentId: number) => Promise<boolean>;
  
  /**
   * Agregar reacción rápida
   */
  addQuickReaction: (eventId: number, reaction: QuickReaction) => Promise<Comment | null>;
  
  /**
   * Validar comentario antes de enviar
   */
  validateComment: (body: string) => CommentValidationResult;
  
  // ==================== ACCIONES UI ====================
  
  /**
   * Establecer comentario en edición
   */
  setEditingComment: (comment: Comment | null) => void;
  
  /**
   * Limpiar errores
   */
  clearErrors: () => void;
  
  /**
   * Resetear store
   */
  reset: () => void;
}

// ==================== ESTADO INICIAL ====================

const initialState = {
  commentsByEvent: {},
  paginationByEvent: {},
  editingComment: null,
  
  loading: {
    comments: false,
    create: false,
    update: false,
    delete: false,
  },
  errors: {
    comments: null,
    create: null,
    update: null,
    delete: null,
  },
};

// ==================== STORE CREATOR ====================

const createCommentsStore: StateCreator<CommentsStore> = (set, get) => ({
  ...initialState,
  
  // ==================== ACCIONES SDK ====================
  
  fetchComments: async (eventId: number, params?: GetCommentsParams) => {
    set((state) => ({
      loading: { ...state.loading, comments: true },
      errors: { ...state.errors, comments: null },
    }));
    
    try {
      const response: PageResponse<Comment> = await commentsApi.getComments(eventId, params);
      
      set((state) => ({
        commentsByEvent: {
          ...state.commentsByEvent,
          [eventId]: response.content,
        },
        paginationByEvent: {
          ...state.paginationByEvent,
          [eventId]: {
            page: response.page.number + 1,
            size: response.page.size,
            total: response.page.totalElements,
            totalPages: response.page.totalPages,
          },
        },
        loading: { ...state.loading, comments: false },
      }));
    } catch (error) {
      logError(error, 'CommentsStore.fetchComments');
      
      const apiError = handleApiError(error);
      
      set({
        loading: { ...get().loading, comments: false },
        errors: { ...get().errors, comments: apiError.message },
      });
    }
  },
  
  fetchCommentById: async (eventId: number, commentId: number) => {
    set((state) => ({
      loading: { ...state.loading, comments: true },
      errors: { ...state.errors, comments: null },
    }));
    
    try {
      const comment = await commentsApi.getCommentById(eventId, commentId);
      
      set({
        loading: { ...get().loading, comments: false },
      });
      
      return comment;
    } catch (error) {
      logError(error, 'CommentsStore.fetchCommentById');
      
      const apiError = handleApiError(error);
      
      set({
        loading: { ...get().loading, comments: false },
        errors: { ...get().errors, comments: apiError.message },
      });
      
      return null;
    }
  },
  
  createComment: async (eventId: number, input: CreateCommentInput) => {
    set((state) => ({
      loading: { ...state.loading, create: true },
      errors: { ...state.errors, create: null },
    }));
    
    try {
      const newComment = await commentsApi.createComment(eventId, input);
      
      // Actualizar lista local
      set((state) => {
        const existingComments = state.commentsByEvent[eventId] || [];
        return {
          commentsByEvent: {
            ...state.commentsByEvent,
            [eventId]: [newComment, ...existingComments],
          },
          loading: { ...state.loading, create: false },
        };
      });
      
      return newComment;
    } catch (error) {
      logError(error, 'CommentsStore.createComment');
      
      const apiError = handleApiError(error);
      
      set({
        loading: { ...get().loading, create: false },
        errors: { ...get().errors, create: apiError.message },
      });
      
      return null;
    }
  },
  
  updateComment: async (eventId: number, commentId: number, input: UpdateCommentInput) => {
    set((state) => ({
      loading: { ...state.loading, update: true },
      errors: { ...state.errors, update: null },
    }));
    
    try {
      const updatedComment = await commentsApi.updateComment(eventId, commentId, input);
      
      // Actualizar en la lista local
      set((state) => {
        const comments = state.commentsByEvent[eventId] || [];
        return {
          commentsByEvent: {
            ...state.commentsByEvent,
            [eventId]: comments.map(c => c.id === commentId ? updatedComment : c),
          },
          loading: { ...state.loading, update: false },
        };
      });
      
      return updatedComment;
    } catch (error) {
      logError(error, 'CommentsStore.updateComment');
      
      const apiError = handleApiError(error);
      
      set({
        loading: { ...get().loading, update: false },
        errors: { ...get().errors, update: apiError.message },
      });
      
      return null;
    }
  },
  
  deleteComment: async (eventId: number, commentId: number) => {
    set((state) => ({
      loading: { ...state.loading, delete: true },
      errors: { ...state.errors, delete: null },
    }));
    
    try {
      await commentsApi.deleteComment(eventId, commentId);
      
      // Remover de la lista local
      set((state) => {
        const comments = state.commentsByEvent[eventId] || [];
        return {
          commentsByEvent: {
            ...state.commentsByEvent,
            [eventId]: comments.filter(c => c.id !== commentId),
          },
          loading: { ...state.loading, delete: false },
        };
      });
      
      return true;
    } catch (error) {
      logError(error, 'CommentsStore.deleteComment');
      
      const apiError = handleApiError(error);
      
      set({
        loading: { ...get().loading, delete: false },
        errors: { ...get().errors, delete: apiError.message },
      });
      
      return false;
    }
  },
  
  addQuickReaction: async (eventId: number, reaction: QuickReaction) => {
    set((state) => ({
      loading: { ...state.loading, create: true },
      errors: { ...state.errors, create: null },
    }));
    
    try {
      const newComment = await commentsApi.addQuickReaction(eventId, reaction);
      
      // Actualizar lista local
      set((state) => {
        const existingComments = state.commentsByEvent[eventId] || [];
        return {
          commentsByEvent: {
            ...state.commentsByEvent,
            [eventId]: [newComment, ...existingComments],
          },
          loading: { ...state.loading, create: false },
        };
      });
      
      return newComment;
    } catch (error) {
      logError(error, 'CommentsStore.addQuickReaction');
      
      const apiError = handleApiError(error);
      
      set({
        loading: { ...get().loading, create: false },
        errors: { ...get().errors, create: apiError.message },
      });
      
      return null;
    }
  },
  
  validateComment: (body: string) => {
    return commentsApi.validateComment(body);
  },
  
  // ==================== ACCIONES UI ====================
  
  setEditingComment: (comment) => {
    set({ editingComment: comment });
  },
  
  clearErrors: () => {
    set({
      errors: {
        comments: null,
        create: null,
        update: null,
        delete: null,
      },
    });
  },
  
  reset: () => {
    set(initialState);
  },
});

// ==================== CREAR STORE ====================

export const useCommentsStore = create<CommentsStore>()(
  devtools(createCommentsStore, { name: 'CommentsStore' })
);
