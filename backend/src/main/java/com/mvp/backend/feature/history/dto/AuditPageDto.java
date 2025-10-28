package com.mvp.backend.feature.history.dto;

import java.util.List;

public record AuditPageDto(
        Long eventId,
        int page,
        int size,
        long totalElements,
        int totalPages,
        List<AuditEntryDto> entries
) { }
