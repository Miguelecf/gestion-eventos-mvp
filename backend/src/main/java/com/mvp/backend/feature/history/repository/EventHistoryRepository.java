package com.mvp.backend.feature.history.repository;

import com.mvp.backend.feature.history.model.EventHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventHistoryRepository extends JpaRepository<EventHistory, Long> {
    List<EventHistory> findByEventIdOrderByAtAsc(Long eventId);
}