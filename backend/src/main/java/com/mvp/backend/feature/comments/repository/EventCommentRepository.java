package com.mvp.backend.feature.comments.repository;

import com.mvp.backend.feature.comments.model.EventComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EventCommentRepository extends JpaRepository<EventComment, Long> {

    Page<EventComment> findByEventIdAndDeletedAtIsNull(Long eventId, Pageable pageable);

    Optional<EventComment> findByIdAndEventIdAndDeletedAtIsNull(Long id, Long eventId);
}
