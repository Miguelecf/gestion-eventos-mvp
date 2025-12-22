package com.mvp.backend.feature.notifications.dto;

import com.mvp.backend.feature.notifications.model.Notification;

public final class NotificationMapper {

    private NotificationMapper() {
    }

    public static NotificationDto toDto(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .body(notification.getBody())
                .read(notification.isRead())
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .actionUrl(notification.getActionUrl())
                .eventId(notification.getEvent() != null ? notification.getEvent().getId() : null)
                .commentId(notification.getComment() != null ? notification.getComment().getId() : null)
                .metadata(notification.getMetadata())
                .build();
    }
}
