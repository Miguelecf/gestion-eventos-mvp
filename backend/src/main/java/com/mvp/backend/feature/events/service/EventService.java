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

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;


@Service
@RequiredArgsConstructor
@Transactional
public class EventService {

    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private UserRepository userRepository;

    /* ---------- Commands ---------- */

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


    public EventResponse update (Long id, EventRequest req){
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


}
