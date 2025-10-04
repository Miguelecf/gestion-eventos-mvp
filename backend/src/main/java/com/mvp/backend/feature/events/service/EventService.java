package com.mvp.backend.feature.events.service;

import com.mvp.backend.feature.availability.exception.AvailabilityConflictException;
import com.mvp.backend.feature.availability.model.AvailabilityParams;
import com.mvp.backend.feature.availability.service.AvailabilityService;
import com.mvp.backend.feature.events.dto.*;
import com.mvp.backend.feature.events.model.Event;
import com.mvp.backend.feature.events.model.Status;
import com.mvp.backend.feature.events.repository.EventRepository;
import com.mvp.backend.feature.users.model.User;
import com.mvp.backend.shared.Priority;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.mvp.backend.feature.catalogs.model.Department;
import com.mvp.backend.feature.catalogs.model.Space;
import com.mvp.backend.feature.catalogs.repository.DepartmentRepository;
import com.mvp.backend.feature.catalogs.repository.SpaceRepository;
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
    private static final int MAX_BUFFER_MINUTES = 240;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final EventRepository eventRepository;
    private final UserService userService;
    private final SpaceRepository spaceRepository;
    private final DepartmentRepository departmentRepository;
    private final EventHistoryRepository eventHistoryRepository;
    private final AvailabilityService availabilityService;

    /* ---------- Commands ---------- */
    public EventCreateResult create(CreateEventDto dto) {
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

        Integer bufferBefore = resolveBuffer(dto.bufferBeforeMin(), space != null ? space.getDefaultBufferBeforeMin() : 0, "bufferBeforeMin");
        Integer bufferAfter = resolveBuffer(dto.bufferAfterMin(), space != null ? space.getDefaultBufferAfterMin() : 0, "bufferAfterMin");
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

        //chequeo de disponibilidad al crear un evento
        AvailabilityParams params = AvailabilityParams.builder()
                .date(dto.date())
                .spaceId(dto.spaceId())
                .freeLocation(freeLocation)
                .scheduleFrom(dto.scheduleFrom())
                .scheduleTo(dto.scheduleTo())
                .bufferBeforeMin(bufferBefore)
                .bufferAfterMin(bufferAfter)
                .build();

        var availabilityResult = availabilityService.checkSpaceAvailability(params);
        if (Boolean.FALSE.equals(availabilityResult.isAvailable())) {
            throw AvailabilityConflictException.internalConflict(availabilityResult);
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

        List<EventCreateResult.ConflictDetail> conflicts = new ArrayList<>();

        // TODO: enviar notificaciones aal correo del usuario creador

        return new EventCreateResult(saved.getId(), saved.getStatus(), !conflicts.isEmpty(), conflicts);
    }

    public EventUpdateResult  update(Long id, UpdateEventDto req) {

        User currentUser = getCurrentUser();

        Event ev = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Event not found"));

        LocalDate previousDate = ev.getDate();
        LocalTime previousFrom = ev.getScheduleFrom();
        LocalTime previousTo = ev.getScheduleTo();
        Status previousStatus = ev.getStatus();
        Long previousSpaceId   = ev.getSpace() != null ? ev.getSpace().getId() : null;
        Integer previousBufferBefore = ev.getBufferBeforeMin();
        Integer previousBufferAfter  = ev.getBufferAfterMin();

        Space newSpace = null;
        if (req.spaceId() != null) {
            newSpace = spaceRepository.findById(req.spaceId())
                    .filter(Space::isActive)
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Space not found"));
        }
        Department newDept = null;
        if (req.departmentId() != null) {
            newDept = departmentRepository.findById(req.departmentId())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Department not found"));
        }

        LocalDate effDate  = req.date() != null ? req.date() : ev.getDate();
        LocalTime effFrom  = req.scheduleFrom() != null ? req.scheduleFrom() : ev.getScheduleFrom();
        LocalTime effTo    = req.scheduleTo() != null ? req.scheduleTo() : ev.getScheduleTo();
        Space   effSpace   = req.spaceId() != null ? newSpace : ev.getSpace();
        String  effFreeLoc = req.freeLocation() != null ? trimToNull(req.freeLocation()) : ev.getFreeLocation();

        boolean hasSpace = effSpace != null;
        boolean hasFree  = effFreeLoc != null && !effFreeLoc.isBlank();
        if (hasSpace == hasFree) {
            throw new DomainValidationException("Debe indicarse un espacio o una ubicación libre, pero no ambos.");
        }

        if (effFrom != null && effTo != null && !effTo.isAfter(effFrom)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "scheduleTo must be after scheduleFrom");
        }

        // asignar los cambios
        if (req.date() != null)                ev.setDate(req.date());
        if (req.technicalSchedule() != null)   ev.setTechnicalSchedule(req.technicalSchedule());
        if (req.scheduleFrom() != null)        ev.setScheduleFrom(req.scheduleFrom());
        if (req.scheduleTo() != null)          ev.setScheduleTo(req.scheduleTo());
        if (req.status() != null)              ev.setStatus(req.status());

        if (req.name() != null)                ev.setName(req.name().trim());
        if (req.requestingArea() != null)      ev.setRequestingArea(trimToNull(req.requestingArea()));
        if (req.requirements() != null)        ev.setRequirements(trimToNull(req.requirements()));
        if (req.coverage() != null)            ev.setCoverage(trimToNull(req.coverage()));
        if (req.observations() != null)        ev.setObservations(trimToNull(req.observations()));

        if (req.priority() != null)            ev.setPriority(req.priority());
        if (req.audienceType() != null)        ev.setAudienceType(req.audienceType());
        if (req.internal() != null)            ev.setInternal(req.internal());
        if (req.requiresTech() != null)        ev.setRequiresTech(req.requiresTech());

        if (req.contactName() != null)         ev.setContactName(trimToNull(req.contactName()));
        if (req.contactEmail() != null)        ev.setContactEmail(trimToNull(req.contactEmail()));
        if (req.contactPhone() != null)        ev.setContactPhone(trimToNull(req.contactPhone()));

        if (newDept != null)                   ev.setDepartment(newDept);

        if (req.spaceId() != null) {           // Cambia a espacio
            ev.setSpace(newSpace);
            ev.setFreeLocation(null);
        } else if (req.freeLocation() != null) { // Cambia a free location
            ev.setSpace(null);
            ev.setFreeLocation(effFreeLoc);
        }

        hasSpace = ev.getSpace() != null;

        // buffers
        Long currentSpaceId  = hasSpace ? ev.getSpace().getId() : null;
        boolean spaceChanged = !Objects.equals(previousSpaceId, currentSpaceId);

        if (req.bufferBeforeMin() != null) {
            mustBeBetween(req.bufferBeforeMin(), 0, 240, "bufferBeforeMin");
            ev.setBufferBeforeMin(req.bufferBeforeMin());
        } else if (spaceChanged) {
            ev.setBufferBeforeMin(hasSpace ? ev.getSpace().getDefaultBufferBeforeMin() : 0);
        }

        if (req.bufferAfterMin() != null) {
            mustBeBetween(req.bufferAfterMin(), 0, 240, "bufferAfterMin");
            ev.setBufferAfterMin(req.bufferAfterMin());
        } else if (spaceChanged) {
            ev.setBufferAfterMin(hasSpace ? ev.getSpace().getDefaultBufferAfterMin() : 0);
        }

        // chequeo de disponibilidad usando valores efectivos finales
        Integer effBufB = ev.getBufferBeforeMin();
        Integer effBufA = ev.getBufferAfterMin();

        // chequeo de disponibilidad
        AvailabilityParams params = AvailabilityParams.builder()
                .date(effDate)
                .spaceId(hasSpace ? ev.getSpace().getId() : null)
                .freeLocation(!hasSpace ? ev.getFreeLocation() : null)
                .scheduleFrom(effFrom)
                .scheduleTo(effTo)
                .bufferBeforeMin(effBufB)
                .bufferAfterMin(effBufA)
                .ignoreEventId(ev.getId())
                .build();

        var availabilityResult = availabilityService.checkSpaceAvailability(params);
        if (Boolean.FALSE.equals(availabilityResult.isAvailable())) {
            throw AvailabilityConflictException.internalConflict(availabilityResult);
        }

        ev.setLastModifiedBy(currentUser);

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

        // agregar las otificaciones de si se movió agenda/espacio
        List<EventCreateResult.ConflictDetail> conflicts = new ArrayList<>();

        return toResponseEventUpdate(saved, !conflicts.isEmpty(), conflicts);
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
    public List<EventResponseDto> listActive(){
        return eventRepository.findByActiveTrue()
                .stream().map(EventMapper::toDto).toList();

        /* Por ejemplo si lo quiero hacer mas por filtro, y no con el metodo findByActiveTrue()
         return eventRepository.findAl().stream().filter(e -> e.isActive()).map(this::toResponse).toList();
        */

    }

    @Transactional(readOnly = true)
    public EventResponseDto getById(Long id){
        return eventRepository.findById(id).map(EventMapper::toDto)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Event not found"));
    }

    @Transactional(readOnly = true)
    public List<EventResponseDto> findByDate(LocalDate date){
        return eventRepository.findByDate(date).stream().map(EventMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<EventResponseDto> findByDateBetween(LocalDate start, LocalDate end) {
        return eventRepository.findByDateBetween(start, end).stream().map(EventMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<EventResponseDto> findByPriority(Priority p) {
        return eventRepository.findByPriority(p).stream().map(EventMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<EventResponseDto> findByStatus(Status s) {
        return eventRepository.findByStatus(s).stream().map(EventMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<EventResponseDto> findByUser(Long userId) {
        return eventRepository.findByCreatedById(userId).stream().map(EventMapper::toDto).toList();
    }

    /* -----Mapping----- */

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

    private static void mustBeBetween(int v, int min, int max, String field) {
        if (v < min || v > max) throw new DomainValidationException(
                field + " must be between " + min + " and " + max);
    }

    private EventUpdateResult toResponseEventUpdate(
            Event ev,
            boolean conflict,
            List<EventCreateResult.ConflictDetail> conflictDetails) {
        // Normalizamos la lista para evitar nulls si alguien pasa null
        List<EventCreateResult.ConflictDetail> details =
                (conflict && conflictDetails != null) ? conflictDetails : List.of();

        return new EventUpdateResult(
                ev.getId(),
                ev.getStatus(),
                conflict,
                details
        );
    }

    private int resolveBuffer(Integer requested, Integer defaultValue, String fieldName) {
        int value = requested != null ? requested : (defaultValue != null ? defaultValue : 0);
        if (value < 0 || value > MAX_BUFFER_MINUTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " must be between 0 and " + MAX_BUFFER_MINUTES);
        }
        return value;
    }
}
