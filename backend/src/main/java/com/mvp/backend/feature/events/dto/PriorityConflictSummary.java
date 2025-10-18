package com.mvp.backend.feature.events.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalTime;

public record PriorityConflictSummary(
        String conflictId,
        Long displacedEventId,
        Long spaceId,
        @JsonFormat(pattern = "HH:mm")
        LocalTime from,
        @JsonFormat(pattern = "HH:mm")
        LocalTime to,
        boolean requiresRebooking
) {
}