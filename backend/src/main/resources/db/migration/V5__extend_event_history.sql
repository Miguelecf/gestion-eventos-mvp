SET NAMES utf8mb4;
SET time_zone = '+00:00';

ALTER TABLE event_history
    ADD COLUMN actor_user_id BIGINT NULL AFTER event_id,
    ADD COLUMN field VARCHAR(64) NULL AFTER actor_user_id,
    ADD COLUMN reason VARCHAR(255) NULL AFTER field,
    ADD COLUMN note VARCHAR(1024) NULL AFTER reason;

ALTER TABLE event_history
    MODIFY COLUMN from_value VARCHAR(256) NULL,
    MODIFY COLUMN to_value VARCHAR(256) NULL,
    MODIFY COLUMN details VARCHAR(1024) NULL;

ALTER TABLE event_history
    ADD CONSTRAINT fk_event_history_actor FOREIGN KEY (actor_user_id) REFERENCES users(id);

CREATE INDEX ix_event_history_event_at_desc ON event_history (event_id, at DESC);
