package com.mvp.backend.feature.requests.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.mvp.backend.feature.requests.model.RequestStatus;
import com.mvp.backend.shared.AudienceType;
import com.mvp.backend.shared.Priority;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record EventRequestResponseDto(
                Long id,
                String trackingUuid,

                @JsonFormat(pattern = "yyyy-MM-dd") LocalDate date,

                @JsonFormat(pattern = "HH:mm") LocalTime technicalSchedule,

                @JsonFormat(pattern = "HH:mm") LocalTime scheduleFrom,

                @JsonFormat(pattern = "HH:mm") LocalTime scheduleTo,

                RequestStatus status,
                String name,

                SpaceRef space,
                String freeLocation,
                DepartmentRef requestingDepartment,

                String requirements,
                String coverage,
                String observations,

                Priority priority,
                AudienceType audienceType,

                Integer bufferBeforeMin,
                Integer bufferAfterMin,

                String contactName,
                String contactEmail,
                String contactPhone,

                @JsonFormat(shape = JsonFormat.Shape.STRING) Instant requestDate,

                @JsonFormat(shape = JsonFormat.Shape.STRING) Instant createdAt,

                @JsonFormat(shape = JsonFormat.Shape.STRING) Instant updatedAt) {
        public record SpaceRef(
                        Long id,
                        String name,
                        Integer capacity,
                        String colorHex) {
        }

        public record DepartmentRef(
                        Long id,
                        String name,
                        String colorHex) {
        }
}
