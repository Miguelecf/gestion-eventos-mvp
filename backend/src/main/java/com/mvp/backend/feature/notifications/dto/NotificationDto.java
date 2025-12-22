package com.mvp.backend.feature.notifications.dto;

import com.mvp.backend.feature.notifications.model.NotificationType;
import lombok.Builder;

import java.time.Instant;

@Builder
public record NotificationDto(
                Long id,
                NotificationType type,
                String title,
                String body,
                boolean read,
                Instant readAt,
                Instant createdAt,
                String actionUrl,
                Long eventId,
                Long commentId,
                String metadata) {
}
