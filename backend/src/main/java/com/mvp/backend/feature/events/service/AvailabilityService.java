package com.mvp.backend.feature.events.service;

import com.mvp.backend.feature.events.dto.EventCreateResult;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;

@Service
public class AvailabilityService {

    public List<EventCreateResult.ConflictDetail> check(
            LocalDate date,
            LocalTime from,
            LocalTime to,
            Long spaceId,
            Integer bufferBefore,
            Integer bufferAfter
    ) {
        // TODO: hacer la parte del chequeo
        return Collections.emptyList();
    }
}