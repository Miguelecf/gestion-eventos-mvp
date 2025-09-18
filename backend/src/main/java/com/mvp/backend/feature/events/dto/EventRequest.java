package com.mvp.backend.feature.events.dto;

import com.mvp.backend.feature.events.model.Status;
import com.mvp.backend.shared.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record EventRequest(
        @NotNull LocalDate date,
        LocalTime technicalSchedule,   // <-- cambia a LocalTime
        LocalTime scheduleFrom,
        LocalTime scheduleTo,
        @NotNull Status status,
        @NotBlank String name,
        String requestingArea,
        String requirements,
        String coverage,
        String observations,
        @NotNull Priority priority,
        @NotNull Long userId
) {}

