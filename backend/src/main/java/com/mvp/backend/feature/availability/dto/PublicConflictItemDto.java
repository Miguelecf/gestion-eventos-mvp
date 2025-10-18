package com.mvp.backend.feature.availability.dto;

import com.mvp.backend.feature.events.model.Status;

public record PublicConflictItemDto(
        Status status,
        String from,
        String to
) {
}