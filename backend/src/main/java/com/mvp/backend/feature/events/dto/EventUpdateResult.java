package com.mvp.backend.feature.events.dto;

import com.mvp.backend.feature.events.model.Status;
import java.util.List;

public record EventUpdateResult(
        Long id,
        Status status,
        boolean conflict,
        List<EventCreateResult.ConflictDetail> conflictDetails
) {}
