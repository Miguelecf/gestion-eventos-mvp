package com.mvp.backend.feature.comments.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentUpdateDto(
        @NotBlank
        @Size(min = 1, max = 2500)
        String body
) {
}
