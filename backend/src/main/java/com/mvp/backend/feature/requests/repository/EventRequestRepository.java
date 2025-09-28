package com.mvp.backend.feature.requests.repository;

import com.mvp.backend.feature.requests.model.EventRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EventRequestRepository extends JpaRepository<EventRequest, Long> {
    Optional<EventRequest> findByTrackingUuid(String trackingUuid);

    boolean existsByTrackingUuid(String trackingUuid);
}