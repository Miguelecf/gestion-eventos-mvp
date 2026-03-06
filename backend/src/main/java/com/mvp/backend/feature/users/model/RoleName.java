package com.mvp.backend.feature.users.model;

import java.util.Locale;

public enum RoleName {
    ADMIN_FULL,
    ADMIN_CEREMONIAL,
    ADMIN_TECNICA,
    USUARIO;

    public static RoleName fromValue(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Rol inválido");
        }

        String normalized = value.trim().toUpperCase(Locale.ROOT);
        if ("USER".equals(normalized)) {
            normalized = "USUARIO";
        }

        try {
            return RoleName.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Rol inválido: " + value);
        }
    }

    public static RoleName fromNullable(String value, RoleName fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return fromValue(value);
    }
}
