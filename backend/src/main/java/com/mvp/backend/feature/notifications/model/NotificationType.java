package com.mvp.backend.feature.notifications.model;

/**
 * Tipos de notificaciones in-app para usuarios internos.
 */
public enum NotificationType {
    /**
     * Cambio de estado de un evento.
     */
    EVENT_STATUS_CHANGED,

    /**
     * Nuevo comentario en un evento del usuario.
     */
    NEW_COMMENT_ON_EVENT,

    /**
     * Conflicto de prioridad detectado.
     */
    PRIORITY_CONFLICT_DETECTED
}
