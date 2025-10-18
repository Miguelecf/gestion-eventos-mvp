SET NAMES utf8mb4;
SET time_zone = '+00:00';

ALTER TABLE events
    ADD COLUMN requires_rebooking BIT(1) NOT NULL DEFAULT b'0' AFTER requires_tech,
    ADD COLUMN tech_support_mode VARCHAR(20) NOT NULL DEFAULT 'SETUP_ONLY' AFTER requires_rebooking;

CREATE TABLE priority_conflicts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    conflict_code VARCHAR(50) NOT NULL,
    high_event_id BIGINT NOT NULL,
    displaced_event_id BIGINT NOT NULL,
    space_id BIGINT NOT NULL,
    date DATE NOT NULL,
    from_time TIME NOT NULL,
    to_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_by_user_id BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    closed_at DATETIME(6) NULL,
    decision VARCHAR(30) NULL,
    decision_by_user_id BIGINT NULL,
    reason VARCHAR(255) NULL,
    CONSTRAINT uk_priority_conflicts_code UNIQUE (conflict_code),
    CONSTRAINT fk_priority_conflicts_high_event FOREIGN KEY (high_event_id) REFERENCES events(id),
    CONSTRAINT fk_priority_conflicts_displaced_event FOREIGN KEY (displaced_event_id) REFERENCES events(id),
    CONSTRAINT fk_priority_conflicts_space FOREIGN KEY (space_id) REFERENCES spaces(id),
    CONSTRAINT fk_priority_conflicts_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_priority_conflicts_decision_by FOREIGN KEY (decision_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX ix_priority_conflicts_high_event ON priority_conflicts (high_event_id, status);
CREATE INDEX ix_priority_conflicts_displaced_event ON priority_conflicts (displaced_event_id, status);

CREATE TABLE tech_capacity_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    active BIT(1) NOT NULL DEFAULT b'1',
    block_minutes INT NOT NULL DEFAULT 30,
    default_slots_per_block INT NOT NULL DEFAULT 10,
    timezone VARCHAR(60) NULL,
    notes VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO tech_capacity_config (active, block_minutes, default_slots_per_block, timezone, notes)
VALUES (b'1', 30, 10, 'UTC', 'Seed default configuration');