package com.mvp.backend.feature.auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserSummary {
    private final Long id;
    private final String username;
    private final String role;
}