package com.mvp.backend.feature.comments.dto;

import com.mvp.backend.feature.comments.model.CommentVisibility;

import java.time.Instant;

public record CommentResponseDto(
        Long id,
        UserRef author,
        String body,
        CommentVisibility visibility,
        Instant createdAt,
        Instant updatedAt,
        UserRef editedBy
) {
    public record UserRef(
            Long id,
            String name
    ) {
    }
}
