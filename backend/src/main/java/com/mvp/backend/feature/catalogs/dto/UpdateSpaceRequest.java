package com.mvp.backend.feature.catalogs.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record UpdateSpaceRequest(
        @Size(max = 150) String name,
        @PositiveOrZero Integer capacity,
        @Min(0) @Max(240) Integer defaultBufferBeforeMin,
        @Min(0) @Max(240) Integer defaultBufferAfterMin,
        @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "colorHex must match #RRGGBB") String colorHex,
        Boolean active
) {
}