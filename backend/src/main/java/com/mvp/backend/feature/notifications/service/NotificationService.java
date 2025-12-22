package com.mvp.backend.feature.notifications.service;

import com.mvp.backend.feature.comments.model.EventComment;
import com.mvp.backend.feature.comments.repository.EventCommentRepository;
import com.mvp.backend.feature.events.model.Event;
import com.mvp.backend.feature.events.repository.EventRepository;
import com.mvp.backend.feature.notifications.dto.CreateNotificationDto;
import com.mvp.backend.feature.notifications.dto.NotificationDto;
import com.mvp.backend.feature.notifications.dto.NotificationMapper;
import com.mvp.backend.feature.notifications.model.Notification;
import com.mvp.backend.feature.notifications.repository.NotificationRepository;
import com.mvp.backend.feature.users.model.User;
import com.mvp.backend.feature.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final EventCommentRepository eventCommentRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Notification create(CreateNotificationDto dto) {
        User user = userRepository.findById(dto.userId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuario no encontrado: " + dto.userId()));

        Event event = resolveEvent(dto.eventId());
        EventComment comment = resolveComment(dto.commentId());

        Notification notification = Notification.builder()
                .user(user)
                .type(dto.type())
                .title(dto.title())
                .body(dto.body())
                .event(event)
                .comment(comment)
                .actionUrl(dto.actionUrl())
                .metadata(dto.metadata())
                .build();

        return notificationRepository.save(notification);
    }

    public void createForUsers(List<Long> userIds, CreateNotificationDto dto) {
        userIds.forEach(userId -> {
            try {
                create(dto.withUserId(userId));
            } catch (Exception e) {
                // swallow individual failures to continue with other recipients
            }
        });
    }

    @Transactional(readOnly = true)
    public Page<NotificationDto> getRecentNotifications(Long userId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository
                .findByUserIdAndActiveTrue(userId, pageable);
        return notifications.map(NotificationMapper::toDto);
    }

    @Transactional(readOnly = true)
    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndReadFalseAndActiveTrue(userId);
    }

    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository
                .findByIdAndUserIdAndActiveTrue(notificationId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Notificacion no encontrada o no pertenece al usuario"));

        if (!notification.isRead()) {
            notification.markAsRead();
            notificationRepository.save(notification);
        }
    }

    public int markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository
                .findByUserIdAndReadFalseAndActiveTrue(userId);

        if (unreadNotifications.isEmpty()) {
            return 0;
        }

        Instant now = Instant.now();
        unreadNotifications.forEach(n -> {
            n.setRead(true);
            n.setReadAt(now);
        });

        notificationRepository.saveAll(unreadNotifications);
        return unreadNotifications.size();
    }

    private Event resolveEvent(Long eventId) {
        if (eventId == null) {
            return null;
        }
        return eventRepository.findById(eventId).orElse(null);
    }

    private EventComment resolveComment(Long commentId) {
        if (commentId == null) {
            return null;
        }
        return eventCommentRepository.findById(commentId).orElse(null);
    }
}
