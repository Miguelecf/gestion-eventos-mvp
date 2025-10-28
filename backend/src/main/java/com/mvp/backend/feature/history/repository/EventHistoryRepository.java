package com.mvp.backend.feature.history.repository;

import com.mvp.backend.feature.history.model.EventHistory;
import com.mvp.backend.feature.history.model.HistoryType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventHistoryRepository extends JpaRepository<EventHistory, Long> {
    List<EventHistory> findByEventIdOrderByAtAsc(Long eventId);

    @Query("""
            SELECT h FROM EventHistory h
            WHERE h.event.id = :eventId
              AND (:type IS NULL OR h.type = :type)
            ORDER BY h.at DESC
            """)
    Page<EventHistory> findByEventIdAndTypeOrderByAtDesc(@Param("eventId") Long eventId,
                                                         @Param("type") HistoryType type,
                                                         Pageable pageable);
}
