package com.mvp.backend.feature.availability.dto;

import com.mvp.backend.feature.events.model.Status;

import java.time.LocalDate;

public record ConflictItemDto(
        Long eventId,
        Status status,
        String title,
        Long spaceId,
        LocalDate date,
        String from,
        String to,
        Integer bufferBeforeMin,
        Integer bufferAfterMin
) {
}