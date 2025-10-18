package com.mvp.backend.feature.events.service;

import com.mvp.backend.feature.availability.exception.AvailabilityConflictException;
import com.mvp.backend.feature.availability.model.AvailabilityParams;
import com.mvp.backend.feature.availability.model.AvailabilityResult;
import com.mvp.backend.feature.availability.model.ConflictItem;
import com.mvp.backend.feature.availability.service.AvailabilityService;
import com.mvp.backend.feature.events.dto.*;
import com.mvp.backend.feature.events.model.Event;
import com.mvp.backend.feature.events.model.Status;
import com.mvp.backend.feature.events.model.TechSupportMode;
import com.mvp.backend.feature.events.repository.EventRepository;
import com.mvp.backend.feature.priority.PriorityPolicy;
import com.mvp.backend.feature.priority.model.PriorityConflict;
import com.mvp.backend.feature.priority.service.PriorityConflictService;
import com.mvp.backend.feature.tech.exception.TechCapacityExceededException;
import com.mvp.backend.feature.tech.service.TechCapacityService;
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
    private final PriorityPolicy priorityPolicy;
    private final TechCapacityService techCapacityService;
    private final PriorityConflictService priorityConflictService;

    /* ---------- Commands ---------- */
    public EventCreateResult create(CreateEventDto dto) {
        User currentUser = getCurrentUser();

        Space space = resolveSpace(dto.spaceId());

        Department department = departmentRepository.findById(dto.departmentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found"));

        String freeLocation = trimToNull(dto.freeLocation());
        if (space == null && freeLocation == null) {
            throw new DomainValidationException("Either spaceId or freeLocation must be provided");
        }

        int bufferBefore = resolveBuffer(dto.bufferBeforeMin(), space != null ? space.getDefaultBufferBeforeMin() : 0, "bufferBeforeMin");
        int bufferAfter = resolveBuffer(dto.bufferAfterMin(), space != null ? space.getDefaultBufferAfterMin() : 0, "bufferAfterMin");
        String normalizedRequestingArea = trimToNull(dto.requestingArea());
        Priority derivedPriority = priorityPolicy.derivePriority(normalizedRequestingArea, dto.priority());
        boolean requiresTech = Boolean.TRUE.equals(dto.requiresTech());
        TechSupportMode techMode = resolveTechSupportMode(requiresTech, dto.techSupportMode());

        if (requiresTech && !techCapacityService.hasCapacity(dto.date(), dto.scheduleFrom(), dto.scheduleTo(), bufferBefore, bufferAfter, techMode, null)) {
            throw techCapacityExceeded();
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
        List<Event> displacedEvents = List.of();

        if (Boolean.FALSE.equals(availabilityResult.isAvailable())) {
            if (space == null || derivedPriority != Priority.HIGH) {
                throw AvailabilityConflictException.internalConflict(availabilityResult);
            }
            displacedEvents = resolvePriorityConflicts(availabilityResult, derivedPriority, null);
        }

        String contactName = resolveContactName(dto.contactName(), currentUser);
        String contactEmail = resolveContactEmail(dto.contactEmail(), currentUser);
        String contactPhone = trimToNull(dto.contactPhone());

        Event event = Event.builder()
                .date(dto.date())
                .technicalSchedule(dto.technicalSchedule())
                .scheduleFrom(dto.scheduleFrom())
                .scheduleTo(dto.scheduleTo())
                .status(Status.EN_REVISION)
                .name(dto.name().trim())
                .requestingArea(normalizedRequestingArea)
                .requirements(trimToNull(dto.requirements()))
                .coverage(trimToNull(dto.coverage()))
                .observations(trimToNull(dto.observations()))
                .priority(derivedPriority)
                .audienceType(dto.audienceType())
                .space(space)
                .freeLocation(freeLocation)
                .department(department)
                .internal(Boolean.TRUE.equals(dto.internal()))
                .requiresTech(requiresTech)
                .techSupportMode(techMode)
                .requiresRebooking(false)
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

        List<PriorityConflictSummary> conflictSummaries = registerPriorityConflicts(saved, displacedEvents, currentUser);
        // TODO: enviar notificaciones aal correo del usuario creador

        return new EventCreateResult(saved.getId(), saved.getPriority(), saved.getStatus(), conflictSummaries);
    }

    public EventUpdateResult  update(Long id, UpdateEventDto req) {

        User currentUser = getCurrentUser();

        Event event  = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Event not found"));

        LocalDate previousDate = event .getDate();
        LocalTime previousFrom = event .getScheduleFrom();
        LocalTime previousTo = event .getScheduleTo();
        Status previousStatus = event .getStatus();
        Long previousSpaceId   = event .getSpace() != null ? event .getSpace().getId() : null;

        Space newSpace = resolveSpace(req.spaceId());

        Department newDept = null;
        if (req.departmentId() != null) {
            newDept = departmentRepository.findById(req.departmentId())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Department not found"));
        }

        Space effectiveSpace = req.spaceId() != null ? newSpace : event.getSpace();
        String effectiveFreeLocation = req.freeLocation() != null ? trimToNull(req.freeLocation()) : event.getFreeLocation();
        boolean hasSpace = effectiveSpace != null;
        boolean hasFreeLocation = StringUtils.hasText(effectiveFreeLocation);

        if (hasSpace == hasFreeLocation) {
            throw new DomainValidationException("Debe indicarse un espacio o una ubicación libre, pero no ambos.");
        }

        LocalDate effectiveDate = req.date() != null ? req.date() : event.getDate();
        LocalTime effectiveFrom = req.scheduleFrom() != null ? req.scheduleFrom() : event.getScheduleFrom();
        LocalTime effectiveTo = req.scheduleTo() != null ? req.scheduleTo() : event.getScheduleTo();

        if (effectiveFrom != null && effectiveTo != null && !effectiveTo.isAfter(effectiveFrom)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "scheduleTo must be after scheduleFrom");
        }

        Long effectiveSpaceId = hasSpace ? effectiveSpace.getId() : null;
        boolean spaceChanged = !Objects.equals(previousSpaceId, effectiveSpaceId);

        int effectiveBufferBefore = req.bufferBeforeMin() != null
                ? resolveBuffer(req.bufferBeforeMin(), event.getBufferBeforeMin(), "bufferBeforeMin")
                : (spaceChanged ? resolveBuffer(null, hasSpace ? effectiveSpace.getDefaultBufferBeforeMin() : 0, "bufferBeforeMin") : event.getBufferBeforeMin());
        int effectiveBufferAfter = req.bufferAfterMin() != null
                ? resolveBuffer(req.bufferAfterMin(), event.getBufferAfterMin(), "bufferAfterMin")
                : (spaceChanged ? resolveBuffer(null, hasSpace ? effectiveSpace.getDefaultBufferAfterMin() : 0, "bufferAfterMin") : event.getBufferAfterMin());

        String effectiveRequestingArea = req.requestingArea() != null ? trimToNull(req.requestingArea()) : event.getRequestingArea();
        Priority requestedPriority = req.priority() != null ? req.priority() : event.getPriority();
        Priority derivedPriority = priorityPolicy.derivePriority(effectiveRequestingArea, requestedPriority);
        boolean requiresTech = req.requiresTech() != null ? req.requiresTech() : event.isRequiresTech();
        TechSupportMode techMode = resolveTechSupportMode(requiresTech,
                req.techSupportMode() != null ? req.techSupportMode() : event.getTechSupportMode());

        if (requiresTech && !techCapacityService.hasCapacity(effectiveDate, effectiveFrom, effectiveTo, effectiveBufferBefore, effectiveBufferAfter, techMode, event.getId())) {
            throw techCapacityExceeded();
        }

        AvailabilityParams params = AvailabilityParams.builder()
                .date(effectiveDate)
                .spaceId(effectiveSpaceId)
                .freeLocation(!hasSpace ? effectiveFreeLocation : null)
                .scheduleFrom(effectiveFrom)
                .scheduleTo(effectiveTo)
                .bufferBeforeMin(effectiveBufferBefore)
                .bufferAfterMin(effectiveBufferAfter)
                .ignoreEventId(event.getId())
                .build();

        var availabilityResult = availabilityService.checkSpaceAvailability(params);
        List<Event> displacedEvents = List.of();
        if (Boolean.FALSE.equals(availabilityResult.isAvailable())) {
            if (!hasSpace || derivedPriority != Priority.HIGH) {
                throw AvailabilityConflictException.internalConflict(availabilityResult);
            }
            displacedEvents = resolvePriorityConflicts(availabilityResult, derivedPriority, event.getId());
        }

        // asignar los cambios
        if (req.date() != null)                event .setDate(req.date());
        if (req.technicalSchedule() != null)   event .setTechnicalSchedule(req.technicalSchedule());
        if (req.scheduleFrom() != null)        event .setScheduleFrom(req.scheduleFrom());
        if (req.scheduleTo() != null)          event .setScheduleTo(req.scheduleTo());
        if (req.status() != null)              event .setStatus(req.status());

        event.setRequestingArea(effectiveRequestingArea);
        if (req.requestingArea() != null)      event .setRequestingArea(trimToNull(req.requestingArea()));
        if (req.requirements() != null)        event .setRequirements(trimToNull(req.requirements()));
        if (req.coverage() != null)            event .setCoverage(trimToNull(req.coverage()));
        if (req.observations() != null)        event .setObservations(trimToNull(req.observations()));

        event.setPriority(derivedPriority);
        if (req.audienceType() != null)        event .setAudienceType(req.audienceType());
        if (req.internal() != null)            event .setInternal(req.internal());

        event.setRequiresTech(requiresTech);
        event.setTechSupportMode(techMode);

        if (req.contactName() != null)         event .setContactName(trimToNull(req.contactName()));
        if (req.contactEmail() != null)        event .setContactEmail(trimToNull(req.contactEmail()));
        if (req.contactPhone() != null)        event .setContactPhone(trimToNull(req.contactPhone()));

        if (newDept != null)                   event .setDepartment(newDept);

        if (req.spaceId() != null) {           // Cambia a espacio
            event .setSpace(newSpace);
            event .setFreeLocation(null);
        } else if (req.freeLocation() != null) { // Cambia a free location
            event .setSpace(null);
            event.setFreeLocation(effectiveFreeLocation);
        }

        event.setBufferBeforeMin(effectiveBufferBefore);
        event.setBufferAfterMin(effectiveBufferAfter);
        event.setLastModifiedBy(currentUser);

        Event saved = eventRepository.save(event);

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
        List<PriorityConflictSummary> conflictSummaries = registerPriorityConflicts(saved, displacedEvents, currentUser);

        return new EventUpdateResult(saved.getId(), saved.getPriority(), saved.getStatus(), conflictSummaries);
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

    private int resolveBuffer(Integer requested, Integer defaultValue, String fieldName) {
        int value = requested != null ? requested : (defaultValue != null ? defaultValue : 0);
        if (value < 0 || value > MAX_BUFFER_MINUTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " must be between 0 and " + MAX_BUFFER_MINUTES);
        }
        return value;
    }

    private Space resolveSpace(Long spaceId) {
        if (spaceId == null) {
            return null;
        }
        return spaceRepository.findById(spaceId)
                .filter(Space::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Space not found"));
    }

    private TechSupportMode resolveTechSupportMode(boolean requiresTech, TechSupportMode requested) {
        if (!requiresTech) {
            return TechSupportMode.SETUP_ONLY;
        }
        return requested != null ? requested : TechSupportMode.SETUP_ONLY;
    }

    private TechCapacityExceededException techCapacityExceeded() {
        return new TechCapacityExceededException("No hay capacidad técnica disponible para el rango solicitado.");
    }

    private List<Event> resolvePriorityConflicts(AvailabilityResult availabilityResult,
                                                 Priority desiredPriority,
                                                 Long ignoreEventId) {
        if (availabilityResult == null || availabilityResult.conflicts() == null) {
            return List.of();
        }
        List<Long> conflictIds = availabilityResult.conflicts().stream()
                .map(ConflictItem::eventId)
                .filter(Objects::nonNull)
                .filter(id -> ignoreEventId == null || !ignoreEventId.equals(id))
                .toList();

        if (conflictIds.isEmpty()) {
            return List.of();
        }

        List<Event> conflictingEvents = eventRepository.findAllById(conflictIds);
        boolean hasTie = conflictingEvents.stream().anyMatch(event -> event.getPriority() == Priority.HIGH);
        if (hasTie) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "PRIORITY_TIE");
        }

        return conflictingEvents.stream()
                .filter(event -> priorityPolicy.isHigher(desiredPriority, event.getPriority()))
                .toList();
    }

    private String resolveContactName(String provided, User fallback) {
        String normalized = trimToNull(provided);
        if (StringUtils.hasText(normalized)) {
            return normalized;
        }
        return (fallback.getName() + " " + fallback.getLastName()).trim();
    }

    private String resolveContactEmail(String provided, User fallback) {
        String normalized = trimToNull(provided);
        return StringUtils.hasText(normalized) ? normalized : fallback.getEmail();
    }

    private List<PriorityConflictSummary> registerPriorityConflicts(Event highPriorityEvent,
                                                                    List<Event> displacedEvents,
                                                                    User triggeredBy) {
        if (displacedEvents == null || displacedEvents.isEmpty()) {
            if (highPriorityEvent.getPriority() != Priority.HIGH) {
                return List.of();
            }
            return priorityConflictService.getOpenConflicts(highPriorityEvent.getId()).stream()
                    .map(this::toSummary)
                    .toList();
        }
        return priorityConflictService.registerConflicts(highPriorityEvent, displacedEvents, triggeredBy).stream()
                .map(this::toSummary)
                .toList();
    }

    private PriorityConflictSummary toSummary(PriorityConflict conflict) {
        return new PriorityConflictSummary(
                conflict.getConflictCode(),
                conflict.getDisplacedEvent().getId(),
                conflict.getSpaceId(),
                conflict.getFromTime(),
                conflict.getToTime(),
                conflict.getDisplacedEvent().isRequiresRebooking()
        );
    }
}
