package com.mvp.backend.feature.notifications.event;

public record PriorityConflictEvent(
                Long conflictId,
                Long displacedEventId,
                Long highEventId) {
}
