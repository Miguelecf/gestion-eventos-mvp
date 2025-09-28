package com.mvp.backend.feature.catalogs.repository;

import com.mvp.backend.feature.catalogs.model.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    boolean existsByName(String name);

    Page<Department> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Department> findByActive(boolean active, Pageable pageable);

    Page<Department> findByActiveAndNameContainingIgnoreCase(boolean active, String name, Pageable pageable);
}