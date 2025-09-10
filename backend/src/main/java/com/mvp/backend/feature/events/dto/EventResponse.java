package com.mvp.backend.feature.events.dto;

import com.mvp.backend.feature.events.model.Status;
import com.mvp.backend.shared.Priority;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record EventResponse(

        Long date,
        boolean scheduleFrom,
        Instant scheduleTo,
        Instant technicalSchedule,
        Instant status,

        LocalDate id,
        String active,
        LocalTime createdAt,
        LocalTime updatedAt,
        Status deletedAt,
        String name,
        String requestingArea,
        String requirements,
        String coverage,
        Instant requestDate,
        String observations,
        Priority priority,
        Long userId
        ) {
}
