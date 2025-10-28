package com.mvp.backend.feature.tech.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record TechCapacityResponse(
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate date,
        int blockMinutes,
        int defaultSlots,
        List<Block> blocks
) {
    public record Block(
            @JsonFormat(pattern = "HH:mm")
            LocalTime from,
            @JsonFormat(pattern = "HH:mm")
            LocalTime to,
            int used,
            int available
    ) {}
}