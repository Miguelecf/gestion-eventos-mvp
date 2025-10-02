package com.mvp.backend.feature.catalogs.controller;

import com.mvp.backend.feature.catalogs.dto.CreateSpaceRequest;
import com.mvp.backend.feature.catalogs.dto.PublicSpaceResponse;
import com.mvp.backend.feature.catalogs.dto.SpaceResponse;
import com.mvp.backend.feature.catalogs.dto.UpdateSpaceRequest;
import com.mvp.backend.feature.catalogs.service.SpaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogs/spaces")
@RequiredArgsConstructor
public class SpaceController {

    private final SpaceService service;

    @GetMapping
    public Page<SpaceResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return service.list(q, active, pageable);
    }

    @GetMapping("/public")
    public List<PublicSpaceResponse> list() {
        return service.listPublicSpaces();
    }

    @GetMapping("/{id}")
    public SpaceResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public ResponseEntity<SpaceResponse> create(@Valid @RequestBody CreateSpaceRequest request) {
        SpaceResponse created = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}")
    public SpaceResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSpaceRequest request
    ) {
        return service.update(id, request);
    }
}