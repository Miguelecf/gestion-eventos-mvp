package com.mvp.backend.feature.availability.model;

import com.mvp.backend.feature.events.model.Status;
import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

@Builder
public record SpaceOccupancy(
        Long spaceId,
        LocalDate date,
        List<SpaceOccupancyBlock> blocks
) {
    @Builder
    public static record SpaceOccupancyBlock(
            String from,
            String to,
            Status status
    ) {
    }
}