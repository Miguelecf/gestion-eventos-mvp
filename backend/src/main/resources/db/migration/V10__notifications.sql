SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- =====================================================
-- Migration V10: Notificaciones In-App
-- =====================================================
-- Autor: Tech Lead
-- Fecha: 2025-12-22
-- Descripcion: Tabla de notificaciones persistentes para usuarios internos
-- =====================================================

CREATE TABLE notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,

  -- Auditoria (compatible con BaseEntity)
  active BIT(1) NOT NULL DEFAULT b'1',
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  deleted_at DATETIME(6) NULL,

  -- Datos de la notificacion
  user_id BIGINT NOT NULL COMMENT 'Usuario destinatario (solo staff interno)',
  type VARCHAR(50) NOT NULL COMMENT 'Tipo de notificacion (enum)',
  title VARCHAR(200) NOT NULL COMMENT 'Titulo de la notificacion',
  body VARCHAR(500) NOT NULL COMMENT 'Descripcion o mensaje',

  -- Referencias opcionales a entidades relacionadas
  event_id BIGINT NULL COMMENT 'Evento relacionado (opcional)',
  comment_id BIGINT NULL COMMENT 'Comentario relacionado (opcional)',

  -- Estado de lectura
  is_read BIT(1) NOT NULL DEFAULT b'0' COMMENT 'Si fue leida por el usuario',
  read_at DATETIME(6) NULL COMMENT 'Timestamp de lectura',

  -- Navegacion (deeplink)
  action_url VARCHAR(500) NULL COMMENT 'URL para navegar al contexto (/events/123)',

  -- Metadata flexible (JSON opcional)
  metadata JSON NULL COMMENT 'Datos adicionales en formato JSON',

  -- Foreign Keys
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  CONSTRAINT fk_notifications_event
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,

  CONSTRAINT fk_notifications_comment
    FOREIGN KEY (comment_id) REFERENCES event_comments(id) ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Notificaciones in-app para usuarios internos';

-- Indices para optimizacion de queries

-- Indice principal: optimiza contador de no leidas y listado ordenado
CREATE INDEX idx_notifications_user_read_created
  ON notifications(user_id, is_read, created_at DESC)
  COMMENT 'Optimiza queries de contador y listado por usuario';

-- Indice secundario: busqueda por evento
CREATE INDEX idx_notifications_event
  ON notifications(event_id)
  COMMENT 'Busqueda de notificaciones por evento';
