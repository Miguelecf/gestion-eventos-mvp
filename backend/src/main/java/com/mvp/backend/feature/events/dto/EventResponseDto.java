package com.mvp.backend.feature.events.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.mvp.backend.feature.events.model.Status;
import com.mvp.backend.feature.events.model.TechSupportMode;
import com.mvp.backend.shared.AudienceType;
import com.mvp.backend.shared.Priority;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record EventResponseDto(
        Long id,
        // Core
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate date,

        @JsonFormat(pattern = "HH:mm")
        LocalTime technicalSchedule,

        @JsonFormat(pattern = "HH:mm")
        LocalTime scheduleFrom,

        @JsonFormat(pattern = "HH:mm")
        LocalTime scheduleTo,

        Status status,
        String name,
        String requestingArea,

        // Ubicación
        SpaceRef space,         // null si hubo freeLocation
        String freeLocation,    // null si hubo space

        // Responsables / catálogos
        DepartmentRef department,

        // Detalle
        String requirements,
        String coverage,
        String observations,

        // Metadatos de gestión
        Priority priority,
        AudienceType audienceType,
        boolean internal,
        boolean ceremonialOk,
        boolean technicalOk,
        boolean requiresTech,

        TechSupportMode techSupportMode,
        boolean requiresRebooking,

        Integer bufferBeforeMin,
        Integer bufferAfterMin,

        // Contacto
        String contactName,
        String contactEmail,
        String contactPhone,

        // Auditoría
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        Instant createdAt,

        @JsonFormat(shape = JsonFormat.Shape.STRING)
        Instant updatedAt,

        UserRef createdBy,
        UserRef lastModifiedBy
) {

    // ---- Proyecciones livianas para anidar en la respuesta
    public record SpaceRef(
            Long id,
            String name,
            Integer capacity,
            String colorHex
    ) {}

    public record DepartmentRef(
            Long id,
            String name,
            String colorHex
    ) {}

    public record UserRef(
            Long id,
            String username,
            String name,
            String lastName,
            String email
    ) {}
}
