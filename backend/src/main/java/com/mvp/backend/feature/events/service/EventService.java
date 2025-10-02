package com.mvp.backend.feature.events.service;


import com.mvp.backend.feature.events.dto.EventRequest;
import com.mvp.backend.feature.events.dto.EventResponse;
import com.mvp.backend.feature.events.model.Event;
import com.mvp.backend.feature.events.model.Status;
import com.mvp.backend.feature.events.repository.EventRepository;
import com.mvp.backend.feature.users.model.User;
import com.mvp.backend.feature.users.repository.UserRepository;
import com.mvp.backend.shared.Priority;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.mvp.backend.feature.catalogs.model.Department;
import com.mvp.backend.feature.catalogs.model.Space;
import com.mvp.backend.feature.catalogs.repository.DepartmentRepository;
import com.mvp.backend.feature.catalogs.repository.SpaceRepository;
import com.mvp.backend.feature.events.dto.CreateEventDto;
import com.mvp.backend.feature.events.dto.EventCreateResult;
import com.mvp.backend.feature.history.model.HistoryType;
import com.mvp.backend.feature.history.model.EventHistory;
import com.mvp.backend.feature.history.repository.EventHistoryRepository;
import com.mvp.backend.feature.users.service.UserService;
import com.mvp.backend.shared.DomainValidationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Objects;

import static org.springframework.http.HttpStatus.NOT_FOUND;


@Service
@RequiredArgsConstructor
@Transactional
public class EventService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final EventRepository eventRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final SpaceRepository spaceRepository;
    private final DepartmentRepository departmentRepository;
    private final EventHistoryRepository eventHistoryRepository;
    private final AvailabilityService availabilityService;

    /* ---------- Commands ---------- */
    public EventCreateResult newEvent(CreateEventDto dto) {
        User currentUser = getCurrentUser();

        Space space = null;
        if (dto.spaceId() != null) {
            space = spaceRepository.findById(dto.spaceId())
                    .filter(Space::isActive)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Space not found"));
        }

        Department department = departmentRepository.findById(dto.departmentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found"));

        String freeLocation = trimToNull(dto.freeLocation());
        if (space == null && freeLocation == null) {
            throw new DomainValidationException("Either spaceId or freeLocation must be provided");
        }

        Integer bufferBefore = dto.bufferBeforeMin();
        Integer bufferAfter = dto.bufferAfterMin();
        if (space != null) {
            if (bufferBefore == null) {
                bufferBefore = space.getDefaultBufferBeforeMin();
            }
            if (bufferAfter == null) {
                bufferAfter = space.getDefaultBufferAfterMin();
            }
        } else {
            if (bufferBefore == null) {
                bufferBefore = 0;
            }
            if (bufferAfter == null) {
                bufferAfter = 0;
            }
        }

        if (bufferBefore < 0 || bufferAfter < 0) {
            throw new DomainValidationException("Buffers must be greater or equal than 0");
        }

        String contactName = trimToNull(dto.contactName());
        String contactEmail = trimToNull(dto.contactEmail());
        String contactPhone = trimToNull(dto.contactPhone());

        if (!StringUtils.hasText(contactName)) {
            contactName = (currentUser.getName() + " " + currentUser.getLastName()).trim();
        }
        if (!StringUtils.hasText(contactEmail)) {
            contactEmail = currentUser.getEmail();
        }

        Event event = Event.builder()
                .date(dto.date())
                .technicalSchedule(dto.technicalSchedule())
                .scheduleFrom(dto.scheduleFrom())
                .scheduleTo(dto.scheduleTo())
                .status(Status.EN_REVISION)
                .name(dto.name().trim())
                .requestingArea(trimToNull(dto.requestingArea()))
                .requirements(trimToNull(dto.requirements()))
                .coverage(trimToNull(dto.coverage()))
                .observations(trimToNull(dto.observations()))
                .priority(dto.priority())
                .audienceType(dto.audienceType())
                .space(space)
                .freeLocation(freeLocation)
                .department(department)
                .internal(Boolean.TRUE.equals(dto.internal()))
                .requiresTech(Boolean.TRUE.equals(dto.requiresTech()))
                .bufferBeforeMin(bufferBefore)
                .bufferAfterMin(bufferAfter)
                .contactName(contactName)
                .contactEmail(contactEmail)
                .contactPhone(contactPhone)
                .createdBy(currentUser)
                .build();

        Event saved = eventRepository.save(event);

        eventHistoryRepository.save(EventHistory.builder()
                .event(saved)
                .at(saved.getCreatedAt())
                .type(HistoryType.STATUS)
                .fromValue(null)
                .toValue(saved.getStatus().name())
                .build());

        List<EventCreateResult.ConflictDetail> conflicts = List.copyOf(availabilityService.check(
                dto.date(),
                dto.scheduleFrom(),
                dto.scheduleTo(),
                space != null ? space.getId() : null,
                bufferBefore,
                bufferAfter
        ));

        // TODO: enviar notificaciones aal correo del usuario creador

        return new EventCreateResult(saved.getId(), saved.getStatus(), !conflicts.isEmpty(), conflicts);
    }

    public EventResponse create(EventRequest req){

        User user = userRepository.findById(req.userId()).orElseThrow(()
                -> new ResponseStatusException(NOT_FOUND,"User not found"));

        if (req.scheduleFrom().isAfter(req.scheduleTo()))
        { throw new ResponseStatusException(NOT_FOUND,"Schedule from must be before schedule to");}

        // Forzamos estado inicial razonable si no viene o viene inválido
        Status initialStatus = req.status() != null ? req.status() : Status.SOLICITADO;

        Event ev = Event.builder()
                .date(req.date())
                .scheduleFrom(req.scheduleFrom())
                .technicalSchedule(req.technicalSchedule())
                .scheduleTo(req.scheduleTo())
                .status(initialStatus)
                .name(req.name())
                .requestingArea(req.requestingArea())
                .requirements(req.requirements())
                .coverage(req.coverage())
                .observations(req.observations())
                .priority(req.priority())
                .createdBy(user)
                .build();

        Event saved = eventRepository.save(ev);
        return toResponse(saved);
    }

    public EventResponse update(Long id, EventRequest req) {
        Event ev = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Event not found"));

        if (req.scheduleFrom() != null && req.scheduleTo() != null && req.scheduleFrom().isAfter(req.scheduleTo())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "scheduleFrom must be before scheduleTo");
        }

        if (!Objects.equals(ev.getCreatedBy().getId(), req.userId())) {
            User user = userService.getById(req.userId());
            ev.setCreatedBy(user);
        }

        LocalDate previousDate = ev.getDate();
        LocalTime previousFrom = ev.getScheduleFrom();
        LocalTime previousTo = ev.getScheduleTo();
        Status previousStatus = ev.getStatus();

        ev.setDate(req.date());
        ev.setTechnicalSchedule(req.technicalSchedule());
        ev.setScheduleFrom(req.scheduleFrom());
        ev.setScheduleTo(req.scheduleTo());
        if (req.status() != null) {
            ev.setStatus(req.status());
        }
        ev.setName(req.name());
        ev.setRequestingArea(req.requestingArea());
        ev.setRequirements(req.requirements());
        ev.setCoverage(req.coverage());
        ev.setObservations(req.observations());
        if (req.priority() != null) {
            ev.setPriority(req.priority());
        }
        Event saved = eventRepository.save(ev);

        Instant now = Instant.now();
        if (req.status() != null && previousStatus != req.status()) {
            eventHistoryRepository.save(EventHistory.builder()
                    .event(saved)
                    .at(now)
                    .type(HistoryType.STATUS)
                    .fromValue(previousStatus != null ? previousStatus.name() : null)
                    .toValue(saved.getStatus().name())
                    .build());
        }

        if (!Objects.equals(previousDate, saved.getDate())
                || !Objects.equals(previousFrom, saved.getScheduleFrom())
                || !Objects.equals(previousTo, saved.getScheduleTo())) {
            String details = buildScheduleDetails(saved.getDate(), saved.getScheduleFrom(), saved.getScheduleTo());
            eventHistoryRepository.save(EventHistory.builder()
                    .event(saved)
                    .at(now)
                    .type(HistoryType.SCHEDULE_CHANGE)
                    .details(StringUtils.hasText(details) ? details : null)
                    .build());
        }

        return toResponse(saved);
    }

    public EventResponse OLDupdate (Long id, EventRequest req){
        Event ev = eventRepository.findById(id).orElseThrow(()
                -> new RuntimeException("Event not found"));

        if (!ev.getCreatedBy().getId().equals(req.userId())){
            User user = userRepository.findById(req.userId()).orElseThrow(()
                    -> new RuntimeException("User not found"));
            ev.setCreatedBy(user);
        }

        ev.setDate(req.date());
        ev.setTechnicalSchedule(req.technicalSchedule());
        ev.setScheduleFrom(req.scheduleFrom());
        ev.setScheduleTo(req.scheduleTo());
        ev.setStatus(req.status() != null ? req.status() : ev.getStatus());
        ev.setName(req.name());
        ev.setRequestingArea(req.requestingArea());
        ev.setRequirements(req.requirements());
        ev.setCoverage(req.coverage());
        ev.setObservations(req.observations());
        ev.setPriority(req.priority() != null ? req.priority() : ev.getPriority());
        Event saved = eventRepository.save(ev);

        return toResponse(saved);
    }

    public void softDelete(Long id){
        Event ev = eventRepository.findById(id).orElseThrow(()
                -> new ResponseStatusException(NOT_FOUND,"Event not found"));

        ev.setActive(false);
        ev.setDeletedAt(Instant.now());
        eventRepository.save(ev);
    }

    /* ----------------- Queries ------------- */
    @Transactional(readOnly = true)
    public List<EventResponse> listActive(){
        return eventRepository.findByActiveTrue()
                .stream().map(this::toResponse).toList();

        /* Por ejemplo si lo quiero hacer mas por filtro, y no con el metodo findByActiveTrue()
         return eventRepository.findAl().stream().filter(e -> e.isActive()).map(this::toResponse).toList();
        */

    }

    @Transactional(readOnly = true)
    public EventResponse getById(Long id){
        return eventRepository.findById(id).map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Event not found"));
    }

    @Transactional(readOnly = true)
    public List<EventResponse> findByDate(LocalDate date){
        return eventRepository.findByDate(date).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<EventResponse> findByDateBetween(LocalDate start, LocalDate end) {
        return eventRepository.findByDateBetween(start, end).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<EventResponse> findByPriority(Priority p) {
        return eventRepository.findByPriority(p).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<EventResponse> findByStatus(Status s) {
        return eventRepository.findByStatus(s).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<EventResponse> findByUser(Long userId) {
        return eventRepository.findByCreatedById(userId).stream().map(this::toResponse).toList();
    }

    /* -----Mapping----- */
    private EventResponse toResponse(Event e) {
        return new EventResponse(
                e.getId(),
                e.isActive(),
                e.getCreatedAt(),
                e.getUpdatedAt(),
                e.getDeletedAt(),

                e.getName(),
                e.getRequestingArea(),
                e.getRequirements(),
                e.getCoverage(),
                e.getObservations(),

                e.getDate(),
                e.getTechnicalSchedule(),
                e.getScheduleFrom(),
                e.getScheduleTo(),
                e.getStatus(),
                e.getPriority(),
                e.getCreatedAt(),

                e.getCreatedBy() != null ? e.getCreatedBy().getId() : null
        );
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No authenticated user");
        }
        Object principal = authentication.getPrincipal();
        Long userId;
        if (principal instanceof com.mvp.backend.feature.auth.security.UserPrincipal userPrincipal) {
            userId = userPrincipal.getId();
        } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails details) {
            // fallback in case of different principal implementation
            userId = userService.getByUsername(details.getUsername()).getId();
        } else if (principal instanceof String username) {
            userId = userService.getByUsername(username).getId();
        } else {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No authenticated user");
        }
        return userService.getById(userId);
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private String buildScheduleDetails(LocalDate date, LocalTime from, LocalTime to) {
        List<String> parts = new ArrayList<>();
        if (date != null) {
            parts.add("Fecha " + date);
        }
        if (from != null && to != null) {
            parts.add("Horario " + from.format(TIME_FORMATTER) + "–" + to.format(TIME_FORMATTER));
        }
        return String.join(" | ", parts);
    }
}
