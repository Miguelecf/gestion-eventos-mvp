package com.mvp.backend.feature.history.service;

import com.mvp.backend.feature.events.model.Event;
import com.mvp.backend.feature.events.model.Status;
import com.mvp.backend.feature.history.dto.AuditEntryDto;
import com.mvp.backend.feature.history.dto.AuditPageDto;
import com.mvp.backend.feature.history.model.EventHistory;
import com.mvp.backend.feature.history.model.HistoryType;
import com.mvp.backend.feature.history.repository.EventHistoryRepository;
import com.mvp.backend.feature.users.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final EventHistoryRepository repository;

    public void recordStatusChange(Event event,
                                   User actor,
                                   Status from,
                                   Status to,
                                   String reason,
                                   String note) {
        repository.save(baseBuilder(event, actor)
                .type(HistoryType.STATUS)
                .field("status")
                .fromValue(from != null ? from.name() : null)
                .toValue(to != null ? to.name() : null)
                .reason(trimToNull(reason))
                .note(trimToNull(note))
                .build());
    }

    public void recordScheduleChange(Event event,
                                     User actor,
                                     LocalDate date,
                                     LocalTime from,
                                     LocalTime to) {
        repository.save(baseBuilder(event, actor)
                .type(HistoryType.SCHEDULE_CHANGE)
                .field("schedule")
                .details(buildScheduleDetails(date, from, to))
                .build());
    }

    public void recordReprogram(Event event,
                                User actor,
                                LocalDate date,
                                LocalTime from,
                                LocalTime to,
                                String reason,
                                String note) {
        repository.save(baseBuilder(event, actor)
                .type(HistoryType.REPROGRAM)
                .field("schedule")
                .details(buildScheduleDetails(date, from, to))
                .reason(trimToNull(reason))
                .note(trimToNull(note))
                .build());
    }

    public void recordFieldUpdate(Event event,
                                  User actor,
                                  String field,
                                  String from,
                                  String to,
                                  String reason,
                                  String note) {
        repository.save(baseBuilder(event, actor)
                .type(HistoryType.FIELD_UPDATE)
                .field(field)
                .fromValue(from)
                .toValue(to)
                .reason(trimToNull(reason))
                .note(trimToNull(note))
                .build());
    }

    public void recordSpaceConflict(Event event,
                                    User actor,
                                    String details,
                                    String reason,
                                    String note) {
        repository.save(baseBuilder(event, actor)
                .type(HistoryType.SPACE_CONFLICT)
                .details(trimToNull(details))
                .reason(trimToNull(reason))
                .note(trimToNull(note))
                .build());
    }

    public void recordTechCapacityReject(Event event,
                                         User actor,
                                         String details,
                                         String reason,
                                         String note) {
        repository.save(baseBuilder(event, actor)
                .type(HistoryType.TECH_CAPACITY_REJECT)
                .details(trimToNull(details))
                .reason(trimToNull(reason))
                .note(trimToNull(note))
                .build());
    }

    public AuditPageDto getEventHistory(Long eventId, HistoryType type, Pageable pageable) {
        Page<EventHistory> page = repository.findByEventIdAndTypeOrderByAtDesc(eventId, type, pageable);
        List<AuditEntryDto> entries = page.getContent().stream()
                .map(this::toDto)
                .toList();
        return new AuditPageDto(
                eventId,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                entries
        );
    }

    private AuditEntryDto toDto(EventHistory history) {
        AuditEntryDto.UserRef actorRef = null;
        User actor = history.getActor();
        if (actor != null) {
            actorRef = new AuditEntryDto.UserRef(
                    actor.getId(),
                    actor.getUsername(),
                    actor.getName(),
                    actor.getLastName(),
                    actor.getEmail()
            );
        }
        return new AuditEntryDto(
                history.getId(),
                history.getType(),
                history.getAt(),
                history.getField(),
                history.getFromValue(),
                history.getToValue(),
                history.getDetails(),
                history.getReason(),
                history.getNote(),
                actorRef
        );
    }

    private EventHistory.EventHistoryBuilder baseBuilder(Event event, User actor) {
        return EventHistory.builder()
                .event(event)
                .actor(actor)
                .at(Instant.now());
    }

    private String buildScheduleDetails(LocalDate date, LocalTime from, LocalTime to) {
        List<String> parts = new ArrayList<>();
        if (date != null) {
            parts.add("Fecha " + date);
        }
        if (from != null && to != null) {
            parts.add("Horario " + from.format(TIME_FORMATTER) + "–" + to.format(TIME_FORMATTER));
        }
        return parts.isEmpty() ? null : String.join(" | ", parts);
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
