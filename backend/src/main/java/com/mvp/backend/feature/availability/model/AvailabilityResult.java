package com.mvp.backend.feature.availability.model;

import lombok.Builder;
import lombok.Singular;

import java.util.Collections;
import java.util.List;

@Builder
public record AvailabilityResult(
        Boolean isAvailable,
        boolean skipped,
        String reason,
        String effectiveFrom,
        String effectiveTo,
        @Singular List<ConflictItem> conflicts,
        List<Object> suggestions
) {
    public AvailabilityResult {
        suggestions = suggestions == null ? Collections.emptyList() : suggestions;
    }
}