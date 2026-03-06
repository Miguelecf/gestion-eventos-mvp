package com.mvp.backend.feature.priority.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.mvp.backend.shared.Priority;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record PendingPriorityConflictResponse(
                String conflictId,
                Long highEventId,
                Long displacedEventId,
                Long spaceId,
                @JsonFormat(pattern = "yyyy-MM-dd") LocalDate date,
                @JsonFormat(pattern = "HH:mm") LocalTime from,
                @JsonFormat(pattern = "HH:mm") LocalTime to,
                Priority priorityHigh,
                Priority priorityDisplaced,
                boolean requiresRebooking,
                @JsonFormat(shape = JsonFormat.Shape.STRING) Instant createdAt,
                Long createdByUserId) {
}
