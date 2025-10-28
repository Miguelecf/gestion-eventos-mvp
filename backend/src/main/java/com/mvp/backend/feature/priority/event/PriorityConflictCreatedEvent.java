package com.mvp.backend.feature.priority.event;

import com.mvp.backend.feature.priority.model.PriorityConflict;

public record PriorityConflictCreatedEvent(PriorityConflict conflict) {
}