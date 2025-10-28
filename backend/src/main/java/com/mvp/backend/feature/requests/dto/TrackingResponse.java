package com.mvp.backend.feature.requests.dto;

import com.mvp.backend.feature.events.model.Status;
import com.mvp.backend.feature.requests.model.RequestStatus;
import com.mvp.backend.feature.requests.dto.TrackingResponse.TimelineEntry.Scope;
import com.mvp.backend.feature.requests.dto.TrackingResponse.TimelineEntry.Type;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record TrackingResponse(
        String trackingUuid,
        RequestData request,
        EventData event,
        ScheduleData schedule,
        LocationData location,
        DepartmentData department,
        List<TimelineEntry> timeline
) {
    public record RequestData(RequestStatus status, Instant submittedAt) { }

    public record EventData(Long id, Status status, boolean internal) { }

    public record ScheduleData(
            LocalDate date,
            LocalTime from,
            LocalTime to,
            LocalTime technical,
            Integer bufferBeforeMin,
            Integer bufferAfterMin
    ) { }

    public record LocationData(LocationType type, Long spaceId, String spaceName, String freeLocation) {
        public enum LocationType { SPACE, FREE }
    }

    public record DepartmentData(Long id, String name) { }

    public record TimelineEntry(
            Instant at,
            Scope scope,
            Type type,
            String from,
            String to,
            String details
    ) {
        public enum Scope { REQUEST, EVENT }
        public enum Type { STATUS, SCHEDULE_CHANGE, FIELD_UPDATE, REPROGRAM, TECH_CAPACITY_REJECT,
            SPACE_CONFLICT, PRIORITY_CONFLICT, COMMENT
        }
    }
}