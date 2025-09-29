package com.mvp.backend.feature.events.dto;

import com.mvp.backend.feature.events.model.Status;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record EventCreateResult(
        Long id,
        Status status,
        boolean conflict,
        List<ConflictDetail> conflictDetails
) {
    public record ConflictDetail(
            Long eventId,
            Long spaceId,
            Overlap overlap,
            String reason
    ) {
        public record Overlap(
                LocalDate date,
                LocalTime from,
                LocalTime to
        ) {
        }
    }
}