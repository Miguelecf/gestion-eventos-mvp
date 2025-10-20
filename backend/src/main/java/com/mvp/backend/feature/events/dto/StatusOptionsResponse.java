package com.mvp.backend.feature.events.dto;

import com.mvp.backend.feature.events.model.Status;

import java.util.List;

public record StatusOptionsResponse(
        Long eventId,
        Status current,
        List<Status> allowed
) { }
