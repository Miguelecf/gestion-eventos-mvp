package com.mvp.backend.feature.availability.model;

import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalTime;

@Builder
public record AvailabilityParams(
        LocalDate date,
        Long spaceId,
        String freeLocation,
        LocalTime scheduleFrom,
        LocalTime scheduleTo,
        Integer bufferBeforeMin,
        Integer bufferAfterMin,
        Long ignoreEventId
) {
}