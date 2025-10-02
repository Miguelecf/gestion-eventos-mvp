package com.mvp.backend.feature.catalogs.repository;

import com.mvp.backend.feature.catalogs.model.Space;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpaceRepository extends JpaRepository<Space, Long> {
    boolean existsByName(String name);

    Page<Space> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Space> findByActive(boolean active, Pageable pageable);

    Page<Space> findByActiveAndNameContainingIgnoreCase(boolean active, String name, Pageable pageable);

    List<Space> findByActiveTrueOrderByNameAsc();
}