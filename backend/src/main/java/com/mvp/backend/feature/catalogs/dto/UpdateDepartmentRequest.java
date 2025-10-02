package com.mvp.backend.feature.catalogs.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateDepartmentRequest(
        @Size(max = 120) String name,
        @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "colorHex must match #RRGGBB") String colorHex,
        Boolean active
) {
}