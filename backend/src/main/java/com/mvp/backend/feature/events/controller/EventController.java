package com.mvp.backend.feature.events.controller;

import com.mvp.backend.feature.events.dto.*;
import com.mvp.backend.feature.events.model.Status;
import com.mvp.backend.feature.events.service.EventService;
import com.mvp.backend.shared.Priority;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
// @CrossOrigin(origins = "http://localhost:5173") // para front en vite.
public class EventController {

    private final EventService service;

    /* ------- Queries ------- */

    // Lista sólo los "activos"
    @GetMapping
    public List<EventResponseDto> listActive() {
        return service.listActive();
    }

    @GetMapping("/{id}")
    public EventResponseDto getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/date")
    public List<EventResponseDto> byDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.findByDate(date);
    }

    @GetMapping("/range")
    public List<EventResponseDto> byRange(
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam("end")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return service.findByDateBetween(start, end);
    }

    @GetMapping("/priority/{priority}")
    public List<EventResponseDto> byPriority(@PathVariable Priority priority) {
        return service.findByPriority(priority);
    }

    @GetMapping("/status/{status}")
    public List<EventResponseDto> byStatus(@PathVariable Status status) {
        return service.findByStatus(status);
    }

    @GetMapping("/user/{userId}")
    public List<EventResponseDto> byUser(@PathVariable Long userId) {
        return service.findByUser(userId);
    }

    /* ------- Commands ------- */
    @PostMapping
    public ResponseEntity<EventCreateResult> create(@Valid @RequestBody CreateEventDto req) {
        EventCreateResult created = service.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}")
    public EventUpdateResult update(@PathVariable Long id, @Valid @RequestBody UpdateEventDto req) {
        return service.update(id, req);
    }

    // Soft delete (no borra, marca inactivo)
    @PatchMapping("/{id}/soft-delete")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void softDelete(@PathVariable Long id) {
        service.softDelete(id);
    }
}
