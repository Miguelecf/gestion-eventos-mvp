package com.mvp.backend.feature.notifications.repository;

import com.mvp.backend.feature.notifications.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserIdAndActiveTrue(Long userId, Pageable pageable);

    long countByUserIdAndReadFalseAndActiveTrue(Long userId);

    Optional<Notification> findByIdAndUserIdAndActiveTrue(Long id, Long userId);

    List<Notification> findByUserIdAndReadFalseAndActiveTrue(Long userId);

    @Query(value = """
            SELECT n FROM Notification n
            LEFT JOIN FETCH n.event
            LEFT JOIN FETCH n.comment
            WHERE n.user.id = :userId
            AND n.active = true
            ORDER BY n.createdAt DESC
            """, countQuery = """
            SELECT count(n) FROM Notification n
            WHERE n.user.id = :userId
            AND n.active = true
            """)
    Page<Notification> findRecentNotificationsWithJoins(
            @Param("userId") Long userId,
            Pageable pageable);
}
