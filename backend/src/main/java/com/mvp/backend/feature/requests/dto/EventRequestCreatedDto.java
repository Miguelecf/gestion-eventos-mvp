package com.mvp.backend.feature.requests.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.mvp.backend.feature.requests.model.RequestStatus;

import java.time.Instant;

public record EventRequestCreatedDto(
        @JsonProperty("tracking_uuid")
        String trackingUuid,
        @JsonProperty("status")
        RequestStatus status,
        @JsonProperty("request_date")
        Instant requestDate
) {
}