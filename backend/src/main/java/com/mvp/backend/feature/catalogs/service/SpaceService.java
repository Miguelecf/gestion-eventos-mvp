package com.mvp.backend.feature.catalogs.service;

import com.mvp.backend.feature.catalogs.dto.CreateSpaceRequest;
import com.mvp.backend.feature.catalogs.dto.PublicSpaceResponse;
import com.mvp.backend.feature.catalogs.dto.SpaceResponse;
import com.mvp.backend.feature.catalogs.dto.UpdateSpaceRequest;
import com.mvp.backend.feature.catalogs.model.Space;
import com.mvp.backend.feature.catalogs.repository.SpaceRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SpaceService {

    private static final int MIN_BUFFER = 0;
    private static final int MAX_BUFFER = 240;

    private final SpaceRepository repository;

    @Transactional(readOnly = true)
    public Page<SpaceResponse> list(String q, Boolean active, Pageable pageable) {
        String query = q != null ? q.trim() : "";
        Page<Space> result;

        if (active == null) {
            if (query.isEmpty()) {
                result = repository.findAll(pageable);
            } else {
                result = repository.findByNameContainingIgnoreCase(query, pageable);
            }
        } else {
            if (query.isEmpty()) {
                result = repository.findByActive(active, pageable);
            } else {
                result = repository.findByActiveAndNameContainingIgnoreCase(active, query, pageable);
            }
        }

        return result.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public SpaceResponse getById(Long id) {
        Space space = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Space not found"));
        return toResponse(space);
    }

    public SpaceResponse create(CreateSpaceRequest request) {
        validateBuffers(request.defaultBufferBeforeMin(), request.defaultBufferAfterMin());

        String trimmedName = request.name().trim();
        if (trimmedName.isEmpty()) {
            throw new IllegalArgumentException("name must not be blank");
        }

        if (repository.existsByName(trimmedName)) {
            throw new DataIntegrityViolationException("Space name already exists");
        }

        Space space = Space.builder()
                .name(trimmedName)
                .capacity(request.capacity())
                .defaultBufferBeforeMin(defaultBuffer(request.defaultBufferBeforeMin()))
                .defaultBufferAfterMin(defaultBuffer(request.defaultBufferAfterMin()))
                .colorHex(normalizeColor(request.colorHex()))
                .active(request.active() == null || request.active())
                .build();

        try {
            Space saved = repository.save(space);
            return toResponse(saved);
        } catch (DataIntegrityViolationException ex) {
            throw ex;
        }
    }

    public SpaceResponse update(Long id, UpdateSpaceRequest request) {
        validateBuffers(request.defaultBufferBeforeMin(), request.defaultBufferAfterMin());

        Space existing = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Space not found"));

        if (request.name() != null) {
            String updatedName = request.name().trim();
            if (updatedName.isEmpty()) {
                throw new IllegalArgumentException("name must not be blank");
            }
            if (!updatedName.equals(existing.getName()) && repository.existsByName(updatedName)) {
                throw new DataIntegrityViolationException("Space name already exists");
            }
            existing.setName(updatedName);
        }
        if (request.capacity() != null) {
            existing.setCapacity(request.capacity());
        }
        if (request.defaultBufferBeforeMin() != null) {
            existing.setDefaultBufferBeforeMin(request.defaultBufferBeforeMin());
        }
        if (request.defaultBufferAfterMin() != null) {
            existing.setDefaultBufferAfterMin(request.defaultBufferAfterMin());
        }
        if (request.colorHex() != null) {
            existing.setColorHex(normalizeColor(request.colorHex()));
        }
        if (request.active() != null) {
            existing.setActive(request.active());
        }

        try {
            Space saved = repository.save(existing);
            return toResponse(saved);
        } catch (DataIntegrityViolationException ex) {
            throw ex;
        }
    }

    @Transactional(readOnly = true)
    public List<PublicSpaceResponse> listPublicSpaces() {
        return repository.findByActiveTrueOrderByNameAsc().stream()
                .map(space -> new PublicSpaceResponse(space.getId(), space.getName(), space.getCapacity()))
                .toList();
    }

    private void validateBuffers(Integer before, Integer after) {
        if (before != null) {
            if (before < MIN_BUFFER || before > MAX_BUFFER) {
                throw new IllegalArgumentException("defaultBufferBeforeMin must be between 0 and 240");
            }
        }
        if (after != null) {
            if (after < MIN_BUFFER || after > MAX_BUFFER) {
                throw new IllegalArgumentException("defaultBufferAfterMin must be between 0 and 240");
            }
        }
    }

    private Integer defaultBuffer(Integer value) {
        return value != null ? value : 0;
    }

    private String normalizeColor(String colorHex) {
        return colorHex != null ? colorHex.trim().toUpperCase() : null;
    }

    private SpaceResponse toResponse(Space space) {
        return new SpaceResponse(
                space.getId(),
                space.getName(),
                space.getCapacity(),
                space.getDefaultBufferBeforeMin(),
                space.getDefaultBufferAfterMin(),
                space.getColorHex(),
                space.isActive()
        );
    }
}