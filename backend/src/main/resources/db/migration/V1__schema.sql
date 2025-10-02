-- Charset/engine por defecto
SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ===========================
-- Tablas base (BaseEntity)
-- ===========================
-- Department
CREATE TABLE departments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  active BIT(1) NOT NULL DEFAULT b'1',
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  deleted_at DATETIME(6) NULL,

  name VARCHAR(120) NOT NULL,
  color_hex VARCHAR(7) NULL,

  CONSTRAINT uk_departments_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Space
CREATE TABLE spaces (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  active BIT(1) NOT NULL DEFAULT b'1',
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  deleted_at DATETIME(6) NULL,

  name VARCHAR(150) NOT NULL,
  capacity INT NULL,
  notes VARCHAR(255) NULL,
  default_buffer_before_min INT NOT NULL DEFAULT 0,
  default_buffer_after_min INT NOT NULL DEFAULT 0,
  color_hex VARCHAR(7) NULL,

  CONSTRAINT uk_spaces_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- User
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  active BIT(1) NOT NULL DEFAULT b'1',
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  deleted_at DATETIME(6) NULL,

  username VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  role VARCHAR(100) NOT NULL,

  -- nuevos campos
  must_change_password BIT(1) NOT NULL DEFAULT b'1',
  failed_login_attempts INT NOT NULL DEFAULT 0,
  last_login_at DATETIME(6) NULL,

  CONSTRAINT uk_users_username UNIQUE (username),
  CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- Events
-- ===========================
CREATE TABLE events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  active BIT(1) NOT NULL DEFAULT b'1',
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  deleted_at DATETIME(6) NULL,

  date DATE NOT NULL,
  technical_schedule TIME NULL,
  schedule_from TIME NULL,
  schedule_to TIME NULL,
  status VARCHAR(20) NOT NULL,

  name VARCHAR(200) NOT NULL,
  requesting_area VARCHAR(150) NULL,

  space_id BIGINT NULL,
  free_location VARCHAR(200) NULL,

  department_id BIGINT NULL,

  requirements VARCHAR(255) NULL,
  coverage LONGTEXT NULL,
  observations LONGTEXT NULL,

  priority VARCHAR(20) NOT NULL,
  audience_type VARCHAR(20) NULL,

  internal BIT(1) NOT NULL DEFAULT b'0',
  ceremonial_ok BIT(1) NOT NULL DEFAULT b'0',
  technical_ok BIT(1) NOT NULL DEFAULT b'0',
  requires_tech BIT(1) NOT NULL DEFAULT b'0',

  buffer_before_min INT NOT NULL DEFAULT 0,
  buffer_after_min INT NOT NULL DEFAULT 0,

  contact_name VARCHAR(120) NULL,
  contact_email VARCHAR(120) NULL,
  contact_phone VARCHAR(30) NULL,

  created_by_user_id BIGINT NOT NULL,
  last_modified_by_user_id BIGINT NULL,

  CONSTRAINT fk_events_space FOREIGN KEY (space_id) REFERENCES spaces(id),
  CONSTRAINT fk_events_department FOREIGN KEY (department_id) REFERENCES departments(id),
  CONSTRAINT fk_events_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id),
  CONSTRAINT fk_events_last_modified_by FOREIGN KEY (last_modified_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX ix_events_space_time ON events (space_id, date, schedule_from, schedule_to, status);
CREATE INDEX ix_events_public ON events (internal, status, date);

-- ===========================
-- Event comments
-- ===========================
CREATE TABLE event_comments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  active BIT(1) NOT NULL DEFAULT b'1',
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  deleted_at DATETIME(6) NULL,

  event_id BIGINT NOT NULL,
  author_user_id BIGINT NOT NULL,
  text LONGTEXT NOT NULL,
  internal_visible BIT(1) NOT NULL DEFAULT b'1',

  CONSTRAINT fk_event_comments_event FOREIGN KEY (event_id) REFERENCES events(id),
  CONSTRAINT fk_event_comments_author FOREIGN KEY (author_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX ix_event_comments_event ON event_comments (event_id);

-- ===========================
-- Event Requests (públicas)
-- ===========================
CREATE TABLE event_requests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  active BIT(1) NOT NULL DEFAULT b'1',
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  deleted_at DATETIME(6) NULL,

  tracking_uuid VARCHAR(36) NOT NULL,
  date DATE NOT NULL,
  technical_schedule TIME NULL,
  schedule_from TIME NULL,
  schedule_to TIME NULL,
  name VARCHAR(200) NOT NULL,

  space_id BIGINT NULL,
  free_location VARCHAR(200) NULL,

  requesting_department_id BIGINT NULL,

  requirements VARCHAR(255) NULL,
  coverage LONGTEXT NULL,
  observations LONGTEXT NULL,

  priority VARCHAR(20) NOT NULL,
  audience_type VARCHAR(20) NOT NULL,

  contact_name VARCHAR(120) NOT NULL,
  contact_email VARCHAR(120) NOT NULL,
  contact_phone VARCHAR(30) NULL,

  buffer_before_min INT NOT NULL DEFAULT 0,
  buffer_after_min INT NOT NULL DEFAULT 0,

  status VARCHAR(20) NOT NULL,
  request_date DATETIME(6) NOT NULL,

  converted_event_id BIGINT NULL,

  CONSTRAINT uk_event_requests_token UNIQUE (tracking_uuid),
  CONSTRAINT fk_event_requests_space FOREIGN KEY (space_id) REFERENCES spaces(id),
  CONSTRAINT fk_event_requests_dept FOREIGN KEY (requesting_department_id) REFERENCES departments(id),
  CONSTRAINT fk_event_requests_converted FOREIGN KEY (converted_event_id) REFERENCES events(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- Refresh Tokens (nuevo)
-- ===========================
CREATE TABLE refresh_tokens (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  token_hash VARCHAR(128) NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  revoked BIT(1) NOT NULL DEFAULT b'0',
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  rotated_from BIGINT NULL,

  CONSTRAINT uk_refresh_tokens_hash UNIQUE (token_hash),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_refresh_tokens_rotated_from FOREIGN KEY (rotated_from) REFERENCES refresh_tokens(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX ix_refresh_tokens_user ON refresh_tokens (user_id);
CREATE INDEX ix_refresh_tokens_expires ON refresh_tokens (expires_at);
