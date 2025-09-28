package com.mvp.backend.feature.requests.service;

import com.mvp.backend.feature.catalogs.model.Department;
import com.mvp.backend.feature.catalogs.model.Space;
import com.mvp.backend.feature.catalogs.repository.DepartmentRepository;
import com.mvp.backend.feature.catalogs.repository.SpaceRepository;
import com.mvp.backend.feature.requests.dto.CreateEventRequestDto;
import com.mvp.backend.feature.requests.dto.EventRequestCreatedDto;
import com.mvp.backend.feature.requests.model.EventRequest;
import com.mvp.backend.feature.requests.model.RequestStatus;
import com.mvp.backend.feature.requests.repository.EventRequestRepository;
import com.mvp.backend.shared.DomainValidationException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventRequestService {

    private final EventRequestRepository eventRequestRepository;
    private final SpaceRepository spaceRepository;
    private final DepartmentRepository departmentRepository;

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
            // TODO: agregar el chequeo de espacio para el formulario interno
        }

        Department department = null;
        if (dto.requestingDepartmentId() != null) {
            department = departmentRepository.findById(dto.requestingDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Department not found"));
        }

        String freeLocation = trimToNull(dto.freeLocation());
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
                .bufferBeforeMin(dto.bufferBeforeMin())
                .bufferAfterMin(dto.bufferAfterMin())
                .status(RequestStatus.RECEIVED)
                .requestDate(Instant.now())
                .build();

        EventRequest saved = eventRequestRepository.save(request);

        // TODO: agregar el envio de notificacion mail cuando se crea una solicitud de evento

        return new EventRequestCreatedDto(saved.getTrackingUuid(), saved.getStatus(), saved.getRequestDate());
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