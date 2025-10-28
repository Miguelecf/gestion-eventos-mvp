package com.mvp.backend.feature.events.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.mvp.backend.feature.events.model.TechSupportMode;
import com.mvp.backend.shared.AudienceType;
import com.mvp.backend.shared.Priority;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;

public record UpdateEventDto(
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate date,

        @JsonFormat(pattern = "HH:mm")
        LocalTime technicalSchedule,

        @JsonFormat(pattern = "HH:mm")
        LocalTime scheduleFrom,

        @JsonFormat(pattern = "HH:mm")
        LocalTime scheduleTo,

        @Positive Long spaceId,
        @Size(max = 200) String freeLocation,

        @Positive Long departmentId,

        @Size(max = 200) String name,
        @Size(max = 150) String requestingArea,
        @Size(max = 255) String requirements,
        String coverage,
        String observations,

        Priority priority,
        AudienceType audienceType,

        Boolean internal,
        Boolean requiresTech,
        TechSupportMode techSupportMode,

        @Min(0) @Max(240) Integer bufferBeforeMin,
        @Min(0) @Max(240) Integer bufferAfterMin,

        @Size(max = 120) String contactName,
        @Email @Size(max = 120) String contactEmail,
        @Size(max = 30) String contactPhone
) { }
