package com.mvp.backend.feature.notifications.listener;

import com.mvp.backend.feature.comments.model.EventComment;
import com.mvp.backend.feature.comments.repository.EventCommentRepository;
import com.mvp.backend.feature.events.model.Event;
import com.mvp.backend.feature.events.repository.EventRepository;
import com.mvp.backend.feature.notifications.dto.CreateNotificationDto;
import com.mvp.backend.feature.notifications.event.EventStatusChangedEvent;
import com.mvp.backend.feature.notifications.event.NewCommentEvent;
import com.mvp.backend.feature.notifications.event.PriorityConflictEvent;
import com.mvp.backend.feature.notifications.service.NotificationFactory;
import com.mvp.backend.feature.notifications.service.NotificationService;
import com.mvp.backend.feature.priority.model.PriorityConflict;
import com.mvp.backend.feature.priority.repository.PriorityConflictRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;
    private final NotificationFactory notificationFactory;
    private final EventRepository eventRepository;
    private final EventCommentRepository eventCommentRepository;
    private final PriorityConflictRepository priorityConflictRepository;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onEventStatusChanged(EventStatusChangedEvent event) {
        Event domainEvent = eventRepository.findById(event.eventId()).orElse(null);
        if (domainEvent == null || domainEvent.getCreatedBy() == null) {
            return;
        }

        if (domainEvent.getCreatedBy().getId().equals(event.actorUserId())) {
            return;
        }

        CreateNotificationDto dto = notificationFactory.eventStatusChanged(
                domainEvent.getCreatedBy(),
                domainEvent,
                event.oldStatus(),
                event.newStatus());

        notificationService.create(dto);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onNewComment(NewCommentEvent event) {
        EventComment comment = eventCommentRepository.findById(event.commentId()).orElse(null);
        if (comment == null) {
            return;
        }

        Event domainEvent = comment.getEvent();
        if (domainEvent == null || domainEvent.getCreatedBy() == null) {
            return;
        }

        if (domainEvent.getCreatedBy().getId().equals(event.authorUserId())) {
            return;
        }

        CreateNotificationDto dto = notificationFactory.newCommentOnEvent(
                domainEvent.getCreatedBy(),
                domainEvent,
                comment);

        notificationService.create(dto);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPriorityConflict(PriorityConflictEvent event) {
        PriorityConflict conflict = priorityConflictRepository.findById(event.conflictId()).orElse(null);
        if (conflict == null) {
            return;
        }

        Event displacedEvent = conflict.getDisplacedEvent();
        if (displacedEvent == null || displacedEvent.getCreatedBy() == null) {
            return;
        }

        CreateNotificationDto dto = notificationFactory.priorityConflictDetected(
                displacedEvent.getCreatedBy(),
                conflict);

        notificationService.create(dto);
    }
}
