package com.mvp.backend.feature.catalogs.dto;

public record SpaceResponse(
        Long id,
        String name,
        Integer capacity,
        Integer defaultBufferBeforeMin,
        Integer defaultBufferAfterMin,
        String colorHex,
        boolean active
) {
}