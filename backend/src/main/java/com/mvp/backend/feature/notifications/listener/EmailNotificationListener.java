package com.mvp.backend.feature.notifications.listener;

import com.mvp.backend.feature.auth.service.EmailService;
import com.mvp.backend.feature.events.model.Event;
import com.mvp.backend.feature.events.model.Status;
import com.mvp.backend.feature.events.repository.EventRepository;
import com.mvp.backend.feature.catalogs.repository.SpaceRepository;
import com.mvp.backend.feature.notifications.event.EventCreatedEmailEvent;
import com.mvp.backend.feature.notifications.event.EventRequestCreatedEmailEvent;
import com.mvp.backend.feature.notifications.event.EventRescheduledEmailEvent;
import com.mvp.backend.feature.notifications.event.EventStatusChangedEvent;
import com.mvp.backend.feature.requests.model.EventRequest;
import com.mvp.backend.feature.requests.repository.EventRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationListener {

    private final EmailService emailService;
    private final EventRepository eventRepository;
    private final SpaceRepository spaceRepository;
    private final EventRequestRepository eventRequestRepository;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onEventCreated(EventCreatedEmailEvent event) {
        Event domainEvent = eventRepository.findById(event.eventId()).orElse(null);
        if (domainEvent == null) {
            return;
        }

        String recipient = resolveRecipient(domainEvent.getContactEmail(),
                domainEvent.getCreatedBy() != null ? domainEvent.getCreatedBy().getEmail() : null);
        if (!StringUtils.hasText(recipient)) {
            return;
        }

        String subject = "Gestión de Eventos - Confirmación de solicitud: " + domainEvent.getName();
        String body = """
                Hola,

                Tu solicitud de evento "%s" fue registrada.
                Estado actual: %s
                Fecha y horario: %s
                Ubicación: %s

                Gracias por confiar en nosotros. Pronto revisaremos tu solicitud.
                """.formatted(
                safeString(domainEvent.getName()),
                formatStatus(domainEvent.getStatus()),
                formatSchedule(domainEvent.getDate(), domainEvent.getScheduleFrom(), domainEvent.getScheduleTo()),
                formatLocation(domainEvent.getSpace() != null ? domainEvent.getSpace().getName() : null,
                        domainEvent.getFreeLocation()));

        sendSafe(recipient, subject, body, "eventCreated", domainEvent.getId());
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onEventStatusChanged(EventStatusChangedEvent event) {
        Event domainEvent = eventRepository.findById(event.eventId()).orElse(null);
        if (domainEvent == null) {
            return;
        }

        String recipient = resolveRecipient(domainEvent.getContactEmail(),
                domainEvent.getCreatedBy() != null ? domainEvent.getCreatedBy().getEmail() : null);
        if (!StringUtils.hasText(recipient)) {
            return;
        }

        String subject = "Gestión de Eventos - Estado actualizado: " + domainEvent.getName() + " → "
                + event.newStatus();
        String body = """
                Hola,

                El evento "%s" cambió de estado: %s → %s.

                Estado nuevo: %s
                """.formatted(
                safeString(domainEvent.getName()),
                formatStatus(event.oldStatus()),
                formatStatus(event.newStatus()),
                formatStatus(event.newStatus()));

        sendSafe(recipient, subject, body, "eventStatusChanged", domainEvent.getId());
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onEventRescheduled(EventRescheduledEmailEvent event) {
        Event domainEvent = eventRepository.findById(event.eventId()).orElse(null);
        if (domainEvent == null) {
            return;
        }

        String recipient = resolveRecipient(domainEvent.getContactEmail(),
                domainEvent.getCreatedBy() != null ? domainEvent.getCreatedBy().getEmail() : null);
        if (!StringUtils.hasText(recipient)) {
            return;
        }

        String previousLocation = formatLocation(
                event.previousSpaceId() != null
                        ? spaceRepository.findById(event.previousSpaceId()).map(s -> s.getName()).orElse(null)
                        : null,
                event.previousFreeLocation());
        String newLocation = formatLocation(
                domainEvent.getSpace() != null ? domainEvent.getSpace().getName() : null,
                domainEvent.getFreeLocation());

        String subject = "Gestión de Eventos - Actualización de agenda: " + domainEvent.getName();
        String body = """
                Hola,

                El evento "%s" fue reprogramado o movido de espacio.

                Antes:
                - Fecha y horario: %s
                - Ubicación: %s

                Ahora:
                - Fecha y horario: %s
                - Ubicación: %s
                """.formatted(
                safeString(domainEvent.getName()),
                formatSchedule(event.previousDate(), event.previousFrom(), event.previousTo()),
                previousLocation,
                formatSchedule(domainEvent.getDate(), domainEvent.getScheduleFrom(), domainEvent.getScheduleTo()),
                newLocation);

        sendSafe(recipient, subject, body, "eventRescheduled", domainEvent.getId());
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onEventRequestCreated(EventRequestCreatedEmailEvent event) {
        EventRequest request = eventRequestRepository.findById(event.eventRequestId()).orElse(null);
        if (request == null) {
            return;
        }

        String recipient = request.getContactEmail();
        if (!StringUtils.hasText(recipient)) {
            return;
        }

        String subject = "Gestión de Eventos - Confirmación de solicitud: " + request.getName();
        String body = """
                Hola %s,

                Recibimos tu solicitud de evento "%s".
                Estado actual: %s
                Fecha y horario: %s
                Ubicación: %s

                Gracias por contactarnos. Te informaremos cualquier novedad.
                """.formatted(
                safeString(request.getContactName()),
                safeString(request.getName()),
                request.getStatus(),
                formatSchedule(request.getDate(), request.getScheduleFrom(), request.getScheduleTo()),
                formatLocation(request.getSpace() != null ? request.getSpace().getName() : null,
                        request.getFreeLocation()));

        sendSafe(recipient, subject, body, "publicEventRequestCreated", request.getId());
    }

    private void sendSafe(String to, String subject, String body, String reason, Long aggregateId) {
        try {
            emailService.send(to, subject, body);
        } catch (Exception e) {
            log.warn("Email {} failed to send to={} aggregateId={}", reason, to, aggregateId, e);
        }
    }

    private String resolveRecipient(String contactEmail, String requesterEmail) {
        if (StringUtils.hasText(contactEmail)) {
            return contactEmail;
        }
        if (StringUtils.hasText(requesterEmail)) {
            return requesterEmail;
        }
        return null;
    }

    private String formatSchedule(LocalDate date, LocalTime from, LocalTime to) {
        if (date == null) {
            return "A definir";
        }
        if (from == null || to == null) {
            return date.toString();
        }
        return "%s %s - %s".formatted(date, from, to);
    }

    private String formatLocation(String spaceName, String freeLocation) {
        if (StringUtils.hasText(spaceName)) {
            return spaceName;
        }
        if (StringUtils.hasText(freeLocation)) {
            return freeLocation;
        }
        return "A definir";
    }

    private String formatStatus(Status status) {
        return status != null ? status.name() : "SIN_ESTADO";
    }

    private String safeString(String value) {
        return value != null ? value : "";
    }
}
