package com.mvp.backend.feature.catalogs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateDepartmentRequest(
        @NotBlank @Size(max = 120) String name,
        @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "colorHex must match #RRGGBB") String colorHex,
        Boolean active
) {
}