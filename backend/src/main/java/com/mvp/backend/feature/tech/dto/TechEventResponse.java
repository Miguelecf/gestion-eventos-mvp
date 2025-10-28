package com.mvp.backend.feature.tech.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.mvp.backend.feature.events.model.TechSupportMode;

import java.time.LocalTime;

public record TechEventResponse(
        Long eventId,
        String name,
        Long spaceId,
        @JsonFormat(pattern = "HH:mm")
        LocalTime from,
        @JsonFormat(pattern = "HH:mm")
        LocalTime to,
        TechSupportMode techSupportMode,
        String requestingArea
) {
}