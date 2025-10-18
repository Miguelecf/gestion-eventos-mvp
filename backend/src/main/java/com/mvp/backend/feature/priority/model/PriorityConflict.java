package com.mvp.backend.feature.priority.model;

import com.mvp.backend.feature.events.model.Event;
import com.mvp.backend.feature.users.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "priority_conflicts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriorityConflict {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conflict_code", nullable = false, unique = true, length = 50)
    private String conflictCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "high_event_id")
    private Event highEvent;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "displaced_event_id")
    private Event displacedEvent;

    @Column(name = "space_id", nullable = false)
    private Long spaceId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "from_time", nullable = false)
    private LocalTime fromTime;

    @Column(name = "to_time", nullable = false)
    private LocalTime toTime;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private PriorityConflictStatus status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private PriorityConflictDecision decision;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decision_by_user_id")
    private User decisionBy;

    @Column(length = 255)
    private String reason;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
        if (status == null) {
            status = PriorityConflictStatus.OPEN;
        }
    }
}