package com.mvp.backend.feature.events.controller;

import com.mvp.backend.feature.events.dto.*;
import com.mvp.backend.feature.events.model.Status;
import com.mvp.backend.feature.events.service.EventService;
import com.mvp.backend.shared.Priority;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    /**
     * Lista eventos activos con soporte dual:
     * - Sin parámetros: devuelve List completa (para calendario)
     * - Con page/size: devuelve Page paginado (para listado)
     */
    @GetMapping
    public ResponseEntity<?> listActive(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort) {
        // Si tiene parámetros de paginación -> devolver Page
        if (page != null || size != null) {
            Pageable pageable = PageRequest.of(
                    page != null ? page : 0,
                    size != null ? size : 20,
                    parseSort(sort));
            Page<EventResponseDto> pagedResult = service.listActivePaged(pageable);
            return ResponseEntity.ok(pagedResult);
        }

        // Sin parámetros -> devolver List completa (para calendario)
        List<EventResponseDto> allEvents = service.listActive();
        return ResponseEntity.ok(allEvents);
    }

    /**
     * Parsea el parámetro sort en formato "field,direction" o
     * "field1,direction1;field2,direction2"
     * Ejemplo: "date,asc" o "date,asc;priority,desc"
     */
    private Sort parseSort(String sortParam) {
        if (sortParam == null || sortParam.isBlank()) {
            return Sort.by(Sort.Direction.ASC, "date"); // Default: ordenar por fecha ascendente
        }

        String[] sortPairs = sortParam.split(";");
        Sort sort = Sort.unsorted();

        for (String pair : sortPairs) {
            String[] parts = pair.split(",");
            if (parts.length == 2) {
                String field = parts[0].trim();
                String direction = parts[1].trim();
                Sort.Direction dir = "desc".equalsIgnoreCase(direction)
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;
                sort = sort.and(Sort.by(dir, field));
            }
        }

        return sort.isSorted() ? sort : Sort.by(Sort.Direction.ASC, "date");
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
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
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
