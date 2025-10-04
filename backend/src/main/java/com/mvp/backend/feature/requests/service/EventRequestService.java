package com.mvp.backend.feature.requests.service;

import com.mvp.backend.feature.availability.exception.AvailabilityConflictException;
import com.mvp.backend.feature.availability.model.AvailabilityParams;
import com.mvp.backend.feature.availability.service.AvailabilityService;
import com.mvp.backend.feature.catalogs.model.Department;
import com.mvp.backend.feature.catalogs.model.Space;
import com.mvp.backend.feature.catalogs.repository.DepartmentRepository;
import com.mvp.backend.feature.catalogs.repository.SpaceRepository;
import com.mvp.backend.feature.events.model.Event;
import com.mvp.backend.feature.history.model.HistoryType;
import com.mvp.backend.feature.history.model.EventHistory;
import com.mvp.backend.feature.history.model.EventRequestHistory;
import com.mvp.backend.feature.history.repository.EventHistoryRepository;
import com.mvp.backend.feature.history.repository.EventRequestHistoryRepository;
import com.mvp.backend.feature.requests.dto.CreateEventRequestDto;
import com.mvp.backend.feature.requests.dto.EventRequestCreatedDto;
import com.mvp.backend.feature.requests.dto.TrackingResponse;
import com.mvp.backend.feature.requests.dto.TrackingResponse.DepartmentData;
import com.mvp.backend.feature.requests.dto.TrackingResponse.EventData;
import com.mvp.backend.feature.requests.dto.TrackingResponse.LocationData;
import com.mvp.backend.feature.requests.dto.TrackingResponse.LocationData.LocationType;
import com.mvp.backend.feature.requests.dto.TrackingResponse.RequestData;
import com.mvp.backend.feature.requests.dto.TrackingResponse.ScheduleData;
import com.mvp.backend.feature.requests.dto.TrackingResponse.TimelineEntry;
import com.mvp.backend.feature.requests.dto.TrackingResponse.TimelineEntry.Scope;
import com.mvp.backend.feature.requests.dto.TrackingResponse.TimelineEntry.Type;
import com.mvp.backend.feature.requests.model.EventRequest;
import com.mvp.backend.feature.requests.model.RequestStatus;
import com.mvp.backend.feature.requests.repository.EventRequestRepository;
import com.mvp.backend.shared.DomainValidationException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventRequestService {

    private final EventRequestRepository eventRequestRepository;
    private final SpaceRepository spaceRepository;
    private final DepartmentRepository departmentRepository;
    private final EventRequestHistoryRepository eventRequestHistoryRepository;
    private final EventHistoryRepository eventHistoryRepository;
    private final AvailabilityService availabilityService;

    @Transactional
    public EventRequestCreatedDto create(CreateEventRequestDto dto) {
        validateSchedule(dto);
        validateLocation(dto);
        validateBuffers(dto);

        Space space = null;
        if (dto.spaceId() != null) {
            space = spaceRepository.findById(dto.spaceId())
                    .filter(Space::isActive)
                    .orElseThrow(() -> new EntityNotFoundException("Space not found"));
        }
        //chequeo si hay espacio disponible
        Integer resolvedBufferBefore = resolveBufferBefore(dto, space);
        Integer resolvedBufferAfter = resolveBufferAfter(dto, space);

        String freeLocation = trimToNull(dto.freeLocation());

        var availabilityParams = AvailabilityParams.builder()
                .date(dto.date())
                .spaceId(dto.spaceId())
                .freeLocation(freeLocation)
                .scheduleFrom(dto.scheduleFrom())
                .scheduleTo(dto.scheduleTo())
                .bufferBeforeMin(resolvedBufferBefore)
                .bufferAfterMin(resolvedBufferAfter)
                .build();

        var availabilityResult = availabilityService.checkSpaceAvailability(availabilityParams);
        if (Boolean.FALSE.equals(availabilityResult.isAvailable())) {
            throw AvailabilityConflictException.publicConflict(availabilityResult);
        }

        Department department = null;
        if (dto.requestingDepartmentId() != null) {
            department = departmentRepository.findById(dto.requestingDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Department not found"));
        }

        String contactPhone = dto.contactPhone().trim();
        String contactEmail = dto.contactEmail().trim();
        String contactName = dto.contactName().trim();
        String name = dto.name().trim();

        EventRequest request = EventRequest.builder()
                .trackingUuid(generateTrackingUuid())
                .date(dto.date())
                .technicalSchedule(dto.technicalSchedule())
                .scheduleFrom(dto.scheduleFrom())
                .scheduleTo(dto.scheduleTo())
                .name(name)
                .space(space)
                .freeLocation(freeLocation)
                .requestingDepartment(department)
                .requirements(trimToNull(dto.requirements()))
                .coverage(trimToNull(dto.coverage()))
                .observations(trimToNull(dto.observations()))
                .priority(dto.priority())
                .audienceType(dto.audienceType())
                .contactName(contactName)
                .contactEmail(contactEmail)
                .contactPhone(contactPhone)
                .bufferBeforeMin(resolvedBufferBefore)
                .bufferAfterMin(resolvedBufferAfter)
                .status(RequestStatus.RECEIVED)
                .requestDate(Instant.now())
                .build();

        EventRequest saved = eventRequestRepository.save(request);

        eventRequestHistoryRepository.save(EventRequestHistory.builder()
                .request(saved)
                .at(saved.getRequestDate())
                .type(HistoryType.STATUS)
                .fromValue(null)
                .toValue(saved.getStatus().name())
                .build());

        // TODO: agregar el envio de notificacion mail cuando se crea una solicitud de evento

        return new EventRequestCreatedDto(saved.getTrackingUuid(), saved.getStatus(), saved.getRequestDate());
    }

    @Transactional(readOnly = true)
    public TrackingResponse getTracking(String trackingUuid) {
        EventRequest request = eventRequestRepository.findByTrackingUuid(trackingUuid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tracking token not found"));

        Event event = request.getConvertedEvent();
        RequestStatus requestStatus = event != null ? RequestStatus.CONVERTED : request.getStatus();
        TrackingResponse.RequestData requestData = new TrackingResponse.RequestData(requestStatus, request.getRequestDate());

        TrackingResponse.EventData eventData = null;
        TrackingResponse.ScheduleData scheduleData;
        TrackingResponse.LocationData locationData;
        TrackingResponse.DepartmentData departmentData;

        if (event != null) {
            eventData = new TrackingResponse.EventData(event.getId(), event.getStatus(), event.isInternal());
            scheduleData = new TrackingResponse.ScheduleData(
                    event.getDate(),
                    event.getScheduleFrom(),
                    event.getScheduleTo(),
                    event.getTechnicalSchedule(),
                    event.getBufferBeforeMin(),
                    event.getBufferAfterMin()
            );
            locationData = toLocationData(event.getSpace(), event.getFreeLocation());
            departmentData = event.getDepartment() != null
                    ? new DepartmentData(event.getDepartment().getId(), event.getDepartment().getName())
                    : null;
        } else {
            scheduleData = new TrackingResponse.ScheduleData(
                    request.getDate(),
                    request.getScheduleFrom(),
                    request.getScheduleTo(),
                    request.getTechnicalSchedule(),
                    request.getBufferBeforeMin(),
                    request.getBufferAfterMin()
            );
            locationData = toLocationData(request.getSpace(), request.getFreeLocation());
            departmentData = request.getRequestingDepartment() != null
                    ? new TrackingResponse.DepartmentData(request.getRequestingDepartment().getId(), request.getRequestingDepartment().getName())
                    : null;
        }

        List<TrackingResponse.TimelineEntry> timeline = buildTimeline(request, event);

        return new TrackingResponse(
                request.getTrackingUuid(),
                requestData,
                eventData,
                scheduleData,
                locationData,
                departmentData,
                timeline
        );
    }

    private Integer resolveBufferBefore(CreateEventRequestDto dto, Space space) {
        if (dto.bufferBeforeMin() != null) {
            if (dto.bufferBeforeMin() < 0 || dto.bufferBeforeMin() > 240) {
                throw new DomainValidationException("bufferBeforeMin must be between 0 and 240");
            }
            return dto.bufferBeforeMin();
        }
        return space != null ? space.getDefaultBufferBeforeMin() : 0;
    }

    private Integer resolveBufferAfter(CreateEventRequestDto dto, Space space) {
        if (dto.bufferAfterMin() != null) {
            if (dto.bufferAfterMin() < 0 || dto.bufferAfterMin() > 240) {
                throw new DomainValidationException("bufferAfterMin must be between 0 and 240");
            }
            return dto.bufferAfterMin();
        }
        return space != null ? space.getDefaultBufferAfterMin() : 0;
    }

    private List<TrackingResponse.TimelineEntry> buildTimeline(EventRequest request, Event event) {
        List<TrackingResponse.TimelineEntry> entries = new ArrayList<>();

        List<EventRequestHistory> requestHistories = eventRequestHistoryRepository
                .findByRequestIdOrderByAtAsc(request.getId());
        for (EventRequestHistory history : requestHistories) {
            Type type = mapType(history.getType());
            if (type == null) {
                continue;
            }
            entries.add(new TimelineEntry(
                    history.getAt(),
                    Scope.REQUEST,
                    type,
                    history.getFromValue(),
                    history.getToValue(),
                    history.getDetails()
            ));
        }

        if (event != null) {
            List<EventHistory> eventHistories = eventHistoryRepository.findByEventIdOrderByAtAsc(event.getId());
            for (EventHistory history : eventHistories) {
                Type type = mapType(history.getType());
                if (type == null) {
                    continue;
                }
                entries.add(new TimelineEntry(
                        history.getAt(),
                        Scope.EVENT,
                        type,
                        history.getFromValue(),
                        history.getToValue(),
                        history.getDetails()
                ));
            }
        }

        entries.sort(Comparator.comparing(TimelineEntry::at));
        return List.copyOf(entries);
    }

    private Type mapType(HistoryType type) {
        return switch (type) {
            case STATUS -> Type.STATUS;
            case SCHEDULE_CHANGE -> Type.SCHEDULE_CHANGE;
        };
    }

    private LocationData toLocationData(Space space, String freeLocation) {
        if (space != null) {
            return new LocationData(LocationType.SPACE, space.getId(), space.getName(), null);
        }
        String normalized = trimToNull(freeLocation);
        return new LocationData(LocationType.FREE, null, null, normalized);
    }

    private void validateBuffers(CreateEventRequestDto dto) {
        if (dto.bufferBeforeMin() == null || dto.bufferBeforeMin() < 0 || dto.bufferBeforeMin() > 240) {
            throw new DomainValidationException("bufferBeforeMin must be between 0 and 240");
        }
        if (dto.bufferAfterMin() == null || dto.bufferAfterMin() < 0 || dto.bufferAfterMin() > 240) {
            throw new DomainValidationException("bufferAfterMin must be between 0 and 240");
        }
    }

    private void validateLocation(CreateEventRequestDto dto) {
        boolean hasSpaceId = dto.spaceId() != null;
        boolean hasFreeLocation = dto.freeLocation() != null && !dto.freeLocation().isBlank();
        if (hasSpaceId == hasFreeLocation) {
            throw new DomainValidationException("Either space_id or free_location must be provided, but not both");
        }
    }

    private void validateSchedule(CreateEventRequestDto dto) {
        if (dto.scheduleFrom() != null && dto.scheduleTo() != null && !dto.scheduleFrom().isBefore(dto.scheduleTo())) {
            throw new DomainValidationException("scheduleFrom must be before scheduleTo");
        }
    }

    private String trimToNull(String value) {
        return Optional.ofNullable(value)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .orElse(null);
    }

    private String generateTrackingUuid() {
        String uuid;
        do {
            uuid = UUID.randomUUID().toString();
        } while (eventRequestRepository.existsByTrackingUuid(uuid));
        return uuid;
    }
}