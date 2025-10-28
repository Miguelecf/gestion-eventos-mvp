package com.mvp.backend.feature.events.dto;

import com.mvp.backend.feature.events.model.Status;
import com.mvp.backend.shared.Priority;

import java.util.List;

public record EventUpdateResult(
        Long eventId,
        Priority priority,
        Status status,
        List<PriorityConflictSummary> priorityConflicts
) {
    public boolean hasConflicts() {
        return priorityConflicts != null && !priorityConflicts.isEmpty();
    }
}

