package com.mvp.backend.feature.requests.controller;

import com.mvp.backend.feature.requests.dto.CreateEventRequestDto;
import com.mvp.backend.feature.requests.dto.EventRequestCreatedDto;
import com.mvp.backend.feature.requests.dto.EventRequestResponseDto;
import com.mvp.backend.feature.requests.service.EventRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/public/event-requests")
@RequiredArgsConstructor
public class EventRequestController {

    private final EventRequestService eventRequestService;

    /**
     * Lista solicitudes de eventos públicas con soporte dual:
     * - Sin parámetros: devuelve List completa
     * - Con page/size: devuelve Page paginado
     */
    @GetMapping
    public ResponseEntity<?> listPublicRequests(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort) {
        // Si tiene parámetros de paginación -> devolver Page
        if (page != null || size != null) {
            Pageable pageable = PageRequest.of(
                    page != null ? page : 0,
                    size != null ? size : 20,
                    parseSort(sort));
            Page<EventRequestResponseDto> pagedResult = eventRequestService.listPublicActivePaged(pageable);
            return ResponseEntity.ok(pagedResult);
        }

        // Sin parámetros -> devolver List completa
        List<EventRequestResponseDto> allRequests = eventRequestService.listPublicActive();
        return ResponseEntity.ok(allRequests);
    }

    /**
     * Parsea el parámetro sort en formato "field,direction" o
     * "field1,direction1;field2,direction2"
     */
    private Sort parseSort(String sortParam) {
        if (sortParam == null || sortParam.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "requestDate"); // Default: más recientes primero
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

        return sort.isSorted() ? sort : Sort.by(Sort.Direction.DESC, "requestDate");
    }

    @PostMapping
    public ResponseEntity<EventRequestCreatedDto> create(@Valid @RequestBody CreateEventRequestDto requestDto) {
        EventRequestCreatedDto created = eventRequestService.create(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
