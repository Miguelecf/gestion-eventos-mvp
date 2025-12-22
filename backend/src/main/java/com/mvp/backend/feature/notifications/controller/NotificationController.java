package com.mvp.backend.feature.notifications.controller;

import com.mvp.backend.feature.auth.security.UserPrincipal;
import com.mvp.backend.feature.notifications.dto.NotificationDto;
import com.mvp.backend.feature.notifications.dto.UnreadCountDto;
import com.mvp.backend.feature.notifications.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notificaciones", description = "Gestion de notificaciones in-app")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Listar notificaciones", description = "Obtiene las notificaciones del usuario actual")
    public ResponseEntity<Page<NotificationDto>> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<NotificationDto> notifications = notificationService
                .getRecentNotifications(getCurrentUserId(), pageable);

        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/count/unread")
    @Operation(summary = "Contador de no leidas", description = "Retorna la cantidad de notificaciones no leidas")
    public ResponseEntity<UnreadCountDto> getUnreadCount() {
        long count = notificationService.countUnread(getCurrentUserId());
        return ResponseEntity.ok(new UnreadCountDto(count));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Marcar como leida", description = "Marca una notificacion especifica como leida")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Marcar todas leidas", description = "Marca todas las notificaciones del usuario como leidas")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead(getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            return userPrincipal.getId();
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
    }
}
