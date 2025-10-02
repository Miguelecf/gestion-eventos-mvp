package com.mvp.backend.feature.catalogs.service;

import com.mvp.backend.feature.catalogs.dto.CreateDepartmentRequest;
import com.mvp.backend.feature.catalogs.dto.DepartmentResponse;
import com.mvp.backend.feature.catalogs.dto.UpdateDepartmentRequest;
import com.mvp.backend.feature.catalogs.model.Department;
import com.mvp.backend.feature.catalogs.repository.DepartmentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class DepartmentService {

    private final DepartmentRepository repository;

    @Transactional(readOnly = true)
    public Page<DepartmentResponse> list(String q, Boolean active, Pageable pageable) {
        String query = q != null ? q.trim() : "";
        Page<Department> result;

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
    public DepartmentResponse getById(Long id) {
        Department department = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Department not found"));
        return toResponse(department);
    }

    public DepartmentResponse create(CreateDepartmentRequest request) {
        String trimmedName = request.name().trim();
        if (trimmedName.isEmpty()) {
            throw new IllegalArgumentException("name must not be blank");
        }

        if (repository.existsByName(trimmedName)) {
            throw new DataIntegrityViolationException("Department name already exists");
        }

        Department department = Department.builder()
                .name(trimmedName)
                .colorHex(normalizeColor(request.colorHex()))
                .active(request.active() == null || request.active())
                .build();

        try {
            Department saved = repository.save(department);
            return toResponse(saved);
        } catch (DataIntegrityViolationException ex) {
            throw ex;
        }
    }

    public DepartmentResponse update(Long id, UpdateDepartmentRequest request) {
        Department existing = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Department not found"));

        if (request.name() != null) {
            String updatedName = request.name().trim();
            if (updatedName.isEmpty()) {
                throw new IllegalArgumentException("name must not be blank");
            }
            if (!updatedName.equals(existing.getName()) && repository.existsByName(updatedName)) {
                throw new DataIntegrityViolationException("Department name already exists");
            }
            existing.setName(updatedName);
        }
        if (request.colorHex() != null) {
            existing.setColorHex(normalizeColor(request.colorHex()));
        }
        if (request.active() != null) {
            existing.setActive(request.active());
        }

        try {
            Department saved = repository.save(existing);
            return toResponse(saved);
        } catch (DataIntegrityViolationException ex) {
            throw ex;
        }
    }

    private DepartmentResponse toResponse(Department department) {
        return new DepartmentResponse(
                department.getId(),
                department.getName(),
                department.getColorHex(),
                department.isActive()
        );
    }

    private String normalizeColor(String colorHex) {
        return colorHex != null ? colorHex.trim().toUpperCase() : null;
    }
}