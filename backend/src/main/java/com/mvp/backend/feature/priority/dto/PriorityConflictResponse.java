package com.mvp.backend.feature.priority.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.Instant;
import java.time.LocalTime;
import java.util.List;

public record PriorityConflictResponse(
        Long eventId,
        List<ConflictDetail> conflicts
) {
    public record ConflictDetail(
            String conflictId,
            Long displacedEventId,
            Long spaceId,
            @JsonFormat(pattern = "HH:mm")
            LocalTime from,
            @JsonFormat(pattern = "HH:mm")
            LocalTime to,
            Audit audit
    ) {
        public record Audit(
                @JsonFormat(shape = JsonFormat.Shape.STRING)
                Instant createdAt,
                Long createdByUserId
        ) {}
    }
}