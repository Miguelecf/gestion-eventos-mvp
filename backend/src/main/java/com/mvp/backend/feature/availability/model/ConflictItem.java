package com.mvp.backend.feature.availability.model;

import com.mvp.backend.feature.events.model.Status;
import lombok.Builder;

import java.time.LocalDate;

@Builder
public record ConflictItem(
        Long eventId,
        Status status,
        String title,
        Long spaceId,
        LocalDate date,
        String from,
        String to,
        boolean internal,
        Integer bufferBeforeMin,
        Integer bufferAfterMin
) {
}
