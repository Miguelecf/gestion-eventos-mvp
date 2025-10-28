package com.mvp.backend.feature.priority.dto;

import com.mvp.backend.feature.priority.model.PriorityConflictDecision;
import com.mvp.backend.feature.priority.model.PriorityConflictStatus;

public record PriorityConflictDecisionResponse(
        String conflictId,
        PriorityConflictDecision decision,
        PriorityConflictStatus status
) {
}