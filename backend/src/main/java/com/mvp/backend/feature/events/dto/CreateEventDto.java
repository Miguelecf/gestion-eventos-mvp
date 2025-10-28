package com.mvp.backend.feature.events.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.mvp.backend.feature.events.model.TechSupportMode;
import com.mvp.backend.feature.requests.validation.TimeRange;
import com.mvp.backend.feature.requests.validation.XorLocation;
import com.mvp.backend.shared.AudienceType;
import com.mvp.backend.shared.Priority;
import com.mvp.backend.shared.validation.HasLocationChoice;
import com.mvp.backend.shared.validation.HasScheduleRange;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.LocalTime;

@XorLocation
@TimeRange
public record CreateEventDto(
        @NotNull(message = "date is required")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate date,

        @JsonFormat(pattern = "HH:mm")
        LocalTime technicalSchedule,

        @NotNull(message = "scheduleFrom is required")
        @JsonFormat(pattern = "HH:mm")
        LocalTime scheduleFrom,

        @NotNull(message = "scheduleTo is required")
        @JsonFormat(pattern = "HH:mm")
        LocalTime scheduleTo,

        @Positive(message = "spaceId must be positive")
        Long spaceId,

        @Size(max = 200, message = "freeLocation must be at most 200 characters")
        String freeLocation,

        @NotNull(message = "departmentId is required")
        @Positive(message = "departmentId must be positive")
        Long departmentId,

        @NotBlank(message = "name is required")
        @Size(max = 200, message = "name must be at most 200 characters")
        String name,

        @Size(max = 150, message = "requestingArea must be at most 150 characters")
        String requestingArea,

        @Size(max = 255, message = "requirements must be at most 255 characters")
        String requirements,

        String coverage,

        String observations,

        @NotNull(message = "priority is required")
        Priority priority,

        AudienceType audienceType,

        Boolean internal,

        Boolean requiresTech,

        TechSupportMode techSupportMode,

        @Min(value = 0, message = "bufferBeforeMin must be at least 0")
        @Max(value = 240, message = "bufferBeforeMin must be at most 240")
        Integer bufferBeforeMin,

        @Min(value = 0, message = "bufferAfterMin must be at least 0")
        @Max(value = 240, message = "bufferAfterMin must be at most 240")
        Integer bufferAfterMin,

        @Size(max = 120, message = "contactName must be at most 120 characters")
        String contactName,

        @Email(message = "contactEmail must be a valid email")
        @Size(max = 120, message = "contactEmail must be at most 120 characters")
        String contactEmail,

        @Size(max = 30, message = "contactPhone must be at most 30 characters")
        String contactPhone
) implements HasScheduleRange, HasLocationChoice {
}