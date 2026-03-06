package com.mvp.backend.feature.users.dto;

import com.mvp.backend.shared.Priority;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(min = 3, max = 100) String username,
        @Email @Size(max = 100) String email,
        @Size(min = 1, max = 100) String name,
        @Size(min = 1, max = 100) String lastName,
        Priority priority
) {
}
