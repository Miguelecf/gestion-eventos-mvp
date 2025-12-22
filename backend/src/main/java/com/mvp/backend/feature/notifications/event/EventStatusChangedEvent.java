package com.mvp.backend.feature.notifications.event;

import com.mvp.backend.feature.events.model.Status;

public record EventStatusChangedEvent(
                Long eventId,
                Status oldStatus,
                Status newStatus,
                Long actorUserId) {
}
