package com.mvp.backend.feature.requests.service;

import com.mvp.backend.feature.catalogs.model.Department;
import com.mvp.backend.feature.catalogs.model.Space;
import com.mvp.backend.feature.requests.dto.EventRequestResponseDto;
import com.mvp.backend.feature.requests.model.EventRequest;

public class EventRequestMapper {

    private EventRequestMapper() {
    }

    public static EventRequestResponseDto toDto(EventRequest request) {
        return new EventRequestResponseDto(
                request.getId(),
                request.getTrackingUuid(),
                request.getDate(),
                request.getTechnicalSchedule(),
                request.getScheduleFrom(),
                request.getScheduleTo(),
                request.getStatus(),
                request.getName(),
                toSpaceRef(request.getSpace()),
                request.getFreeLocation(),
                toDepartmentRef(request.getRequestingDepartment()),
                request.getRequirements(),
                request.getCoverage(),
                request.getObservations(),
                request.getPriority(),
                request.getAudienceType(),
                request.getBufferBeforeMin(),
                request.getBufferAfterMin(),
                request.getContactName(),
                request.getContactEmail(),
                request.getContactPhone(),
                request.getRequestDate(),
                request.getReviewedAt(),
                request.getReviewedBy(),
                request.getConvertedAt(),
                request.getConvertedBy(),
                request.getConvertedEvent() != null ? request.getConvertedEvent().getId() : null,
                request.getCreatedAt(),
                request.getUpdatedAt());
    }

    private static EventRequestResponseDto.SpaceRef toSpaceRef(Space space) {
        if (space == null) {
            return null;
        }
        return new EventRequestResponseDto.SpaceRef(
                space.getId(),
                space.getName(),
                space.getCapacity(),
                space.getColorHex());
    }

    private static EventRequestResponseDto.DepartmentRef toDepartmentRef(Department department) {
        if (department == null) {
            return null;
        }
        return new EventRequestResponseDto.DepartmentRef(
                department.getId(),
                department.getName(),
                department.getColorHex());
    }
}
