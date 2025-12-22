package com.mvp.backend.feature.notifications.dto;

import com.mvp.backend.feature.notifications.model.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record CreateNotificationDto(
        @NotNull(message = "userId es requerido") Long userId,
        @NotNull(message = "type es requerido") NotificationType type,
        @NotBlank(message = "title no puede estar vacio") @Size(max = 200, message = "title no puede exceder 200 caracteres") String title,
        @NotBlank(message = "body no puede estar vacio") @Size(max = 500, message = "body no puede exceder 500 caracteres") String body,
        Long eventId,
        Long commentId,
        String actionUrl,
        String metadata) {
    public CreateNotificationDto withUserId(Long newUserId) {
        return CreateNotificationDto.builder()
                .userId(newUserId)
                .type(this.type)
                .title(this.title)
                .body(this.body)
                .eventId(this.eventId)
                .commentId(this.commentId)
                .actionUrl(this.actionUrl)
                .metadata(this.metadata)
                .build();
    }
}
