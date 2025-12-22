package com.mvp.backend.feature.notifications.event;

public record NewCommentEvent(
                Long eventId,
                Long commentId,
                Long authorUserId) {
}
