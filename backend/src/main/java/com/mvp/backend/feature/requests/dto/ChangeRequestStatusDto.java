package com.mvp.backend.feature.requests.dto;

import com.mvp.backend.feature.requests.model.RequestStatus;
import jakarta.validation.constraints.NotNull;

public record ChangeRequestStatusDto(
        @NotNull(message = "newStatus is required") RequestStatus newStatus,
        String reason) {
}
