SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Adjust event_comments structure to support internal comments management
ALTER TABLE event_comments
    DROP FOREIGN KEY fk_event_comments_author;

ALTER TABLE event_comments
    CHANGE COLUMN author_user_id author_id BIGINT NOT NULL,
    CHANGE COLUMN text body VARCHAR(2500) NOT NULL,
    ADD COLUMN visibility VARCHAR(20) NOT NULL DEFAULT 'INTERNAL' AFTER body,
    ADD COLUMN edited_by_user_id BIGINT NULL AFTER author_id,
    DROP COLUMN internal_visible;

ALTER TABLE event_comments
    ADD CONSTRAINT fk_event_comments_author FOREIGN KEY (author_id) REFERENCES users(id),
    ADD CONSTRAINT fk_event_comments_edited_by FOREIGN KEY (edited_by_user_id) REFERENCES users(id);

CREATE INDEX ix_event_comments_event_created_at ON event_comments (event_id, created_at);

-- Expand event_history payload capacity for comment auditing
ALTER TABLE event_history
    MODIFY COLUMN details TEXT NULL;
