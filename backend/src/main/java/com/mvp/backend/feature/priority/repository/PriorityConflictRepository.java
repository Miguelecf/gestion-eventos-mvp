package com.mvp.backend.feature.priority.repository;

import com.mvp.backend.feature.priority.model.PriorityConflict;
import com.mvp.backend.feature.priority.model.PriorityConflictStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PriorityConflictRepository extends JpaRepository<PriorityConflict, Long> {

    Optional<PriorityConflict> findByConflictCode(String code);

    List<PriorityConflict> findByHighEventIdAndStatus(Long highEventId, PriorityConflictStatus status);

    @Query("select count(pc) from PriorityConflict pc where pc.date = :date")
    long countByDate(@Param("date") LocalDate date);
}