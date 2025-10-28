package com.mvp.backend.feature.tech.repository;

import com.mvp.backend.feature.tech.model.TechCapacityConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TechCapacityConfigRepository extends JpaRepository<TechCapacityConfig, Long> {

    Optional<TechCapacityConfig> findFirstByActiveTrue();
}