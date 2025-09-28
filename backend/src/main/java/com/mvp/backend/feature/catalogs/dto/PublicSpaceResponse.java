package com.mvp.backend.feature.catalogs.dto;

public record PublicSpaceResponse(
        Long id,
        String name,
        Integer capacity
) {
}