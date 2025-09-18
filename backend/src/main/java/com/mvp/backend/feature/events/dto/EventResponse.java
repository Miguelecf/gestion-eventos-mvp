package com.mvp.backend.feature.events.dto;

import com.mvp.backend.feature.events.model.Status;
import com.mvp.backend.shared.Priority;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
public record EventResponse(
        Long id,
        boolean active,
        Instant createdAt,
        Instant updatedAt,
        Instant deletedAt,

        String name,
        String requestingArea,
        String requirements,
        String coverage,
        String observations,

        LocalDate date,
        LocalTime technicalSchedule,
        LocalTime scheduleFrom,
        LocalTime scheduleTo,
        Status status,
        Priority priority,
        Instant requestDate,

        Long userId
) {}
