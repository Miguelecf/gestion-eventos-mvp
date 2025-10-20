package com.mvp.backend.feature.history.dto;

import com.mvp.backend.feature.history.model.HistoryType;

import java.time.Instant;

public record AuditEntryDto(
        Long id,
        HistoryType type,
        Instant at,
        String field,
        String fromValue,
        String toValue,
        String details,
        String reason,
        String note,
        UserRef actor
) {
    public record UserRef(
            Long id,
            String username,
            String name,
            String lastName,
            String email
    ) { }
}
