package com.mvp.backend.feature.users.dto;

import com.mvp.backend.shared.Priority;

import java.time.Instant;

public record UserAdminResponse(
        Long id,
        String username,
        String email,
        String name,
        String lastName,
        Priority priority,
        String role,
        boolean active,
        boolean mustChangePassword,
        int failedLoginAttempts,
        Instant lastLoginAt,
        Instant createdAt,
        Instant updatedAt
) {
}
