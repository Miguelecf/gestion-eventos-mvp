package com.mvp.backend.feature.availability.dto;

import com.mvp.backend.feature.events.model.Status;

import java.time.LocalDate;
import java.util.List;

public record SpaceOccupancyResponseDto(
        Long spaceId,
        LocalDate date,
        List<SpaceOccupancyBlockDto> blocks
) {
    public static record SpaceOccupancyBlockDto(
            String from,
            String to,
            Status status
    ) {
    }
}

