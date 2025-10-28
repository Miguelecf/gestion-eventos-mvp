package com.mvp.backend.feature.comments.dto;

import java.util.List;

public record CommentPageDto(
        Long eventId,
        List<CommentResponseDto> items,
        int page,
        int size,
        long total
) {
}
