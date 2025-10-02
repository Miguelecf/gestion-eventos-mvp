SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE event_request_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  request_id BIGINT NOT NULL,
  at DATETIME(6) NOT NULL,
  type VARCHAR(30) NOT NULL,
  from_value VARCHAR(120) NULL,
  to_value VARCHAR(120) NULL,
  details VARCHAR(255) NULL,

  CONSTRAINT fk_event_request_history_request FOREIGN KEY (request_id) REFERENCES event_requests(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX ix_event_request_history_request ON event_request_history (request_id, at);

CREATE TABLE event_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_id BIGINT NOT NULL,
  at DATETIME(6) NOT NULL,
  type VARCHAR(30) NOT NULL,
  from_value VARCHAR(120) NULL,
  to_value VARCHAR(120) NULL,
  details VARCHAR(255) NULL,

  CONSTRAINT fk_event_history_event FOREIGN KEY (event_id) REFERENCES events(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX ix_event_history_event ON event_history (event_id, at);