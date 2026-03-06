-- Admin workflow fields for event_requests
ALTER TABLE event_requests
    ADD COLUMN reviewed_at  DATETIME(6) NULL AFTER status,
    ADD COLUMN reviewed_by  VARCHAR(120) NULL AFTER reviewed_at,
    ADD COLUMN converted_at DATETIME(6) NULL AFTER reviewed_by,
    ADD COLUMN converted_by VARCHAR(120) NULL AFTER converted_at;
