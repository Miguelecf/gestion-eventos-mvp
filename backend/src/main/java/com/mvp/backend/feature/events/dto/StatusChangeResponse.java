package com.mvp.backend.feature.events.dto;

import com.mvp.backend.feature.events.model.Status;

import java.util.List;

public record StatusChangeResponse(
        Long eventId,
        Status status,
        boolean approvalPending,
        List<String> missing
) {
    public static StatusChangeResponse success(Long eventId, Status status) {
        return new StatusChangeResponse(eventId, status, false, List.of());
    }

    public static StatusChangeResponse pending(Long eventId, Status status, List<String> missing) {
        return new StatusChangeResponse(eventId, status, true, List.copyOf(missing));
    }
}
