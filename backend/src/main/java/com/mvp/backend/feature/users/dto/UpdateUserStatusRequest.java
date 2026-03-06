package com.mvp.backend.feature.users.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateUserStatusRequest(
        @NotNull Boolean active
) {
}
