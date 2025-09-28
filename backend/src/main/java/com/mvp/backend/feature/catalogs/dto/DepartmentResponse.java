package com.mvp.backend.feature.catalogs.dto;

public record DepartmentResponse(
        Long id,
        String name,
        String colorHex,
        boolean active
) {
}