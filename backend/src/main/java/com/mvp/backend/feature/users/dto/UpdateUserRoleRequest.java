package com.mvp.backend.feature.users.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserRoleRequest(
        @NotBlank @Size(max = 100) String role
) {
}
