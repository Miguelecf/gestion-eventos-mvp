package com.mvp.backend.feature.users.dto;

import com.mvp.backend.shared.Priority;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank @Size(min = 3, max = 100) String username,
        @NotBlank @Email @Size(max = 100) String email,
        @NotBlank @Size(min = 1, max = 100) String name,
        @NotBlank @Size(min = 1, max = 100) String lastName,
        @Size(max = 100) String role,
        Priority priority,
        Boolean active
) {
}
