package com.mvp.backend.feature.events.service;

import com.mvp.backend.feature.catalogs.model.Department;
import com.mvp.backend.feature.catalogs.model.Space;
import com.mvp.backend.feature.events.dto.EventResponseDto;
import com.mvp.backend.feature.events.model.Event;
import com.mvp.backend.feature.users.model.User;

public class EventMapper {

    public static EventResponseDto toDto(Event e) {
        return new EventResponseDto(
                e.getId(),
                e.getDate(),
                e.getTechnicalSchedule(),
                e.getScheduleFrom(),
                e.getScheduleTo(),
                e.getStatus(),
                e.getName(),
                e.getRequestingArea(),

                toSpaceRef(e.getSpace()),
                e.getFreeLocation(),

                toDepartmentRef(e.getDepartment()),

                e.getRequirements(),
                e.getCoverage(),
                e.getObservations(),

                e.getPriority(),
                e.getAudienceType(),
                e.isInternal(),
                e.isCeremonialOk(),
                e.isTechnicalOk(),
                e.isRequiresTech(),
                e.getBufferBeforeMin(),
                e.getBufferAfterMin(),

                e.getContactName(),
                e.getContactEmail(),
                e.getContactPhone(),

                e.getCreatedAt(),
                e.getUpdatedAt(),
                toUserRef(e.getCreatedBy()),
                toUserRef(e.getLastModifiedBy())
        );
    }

    private static EventResponseDto.SpaceRef toSpaceRef(Space s) {
        if (s == null) return null;
        return new EventResponseDto.SpaceRef(
                s.getId(),
                s.getName(),
                s.getCapacity(),
                s.getColorHex()
        );
    }

    private static EventResponseDto.DepartmentRef toDepartmentRef(Department d) {
        if (d == null) return null;
        return new EventResponseDto.DepartmentRef(
                d.getId(),
                d.getName(),
                d.getColorHex()
        );
    }

    private static EventResponseDto.UserRef toUserRef(User u) {
        if (u == null) return null;
        return new EventResponseDto.UserRef(
                u.getId(),
                u.getUsername(),
                u.getName(),
                u.getLastName(),
                u.getEmail()
        );
    }
}
