package com.mvp.backend.feature.history.repository;

import com.mvp.backend.feature.history.model.EventRequestHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRequestHistoryRepository extends JpaRepository<EventRequestHistory, Long> {
    List<EventRequestHistory> findByRequestIdOrderByAtAsc(Long requestId);
}