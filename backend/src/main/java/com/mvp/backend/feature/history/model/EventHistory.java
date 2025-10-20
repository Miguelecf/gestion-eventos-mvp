package com.mvp.backend.feature.history.model;

import com.mvp.backend.feature.events.model.Event;
import com.mvp.backend.feature.users.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "event_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_user_id")
    private User actor;

    @Column(name = "field", length = 64)
    private String field;

    @Column(name = "reason", length = 255)
    private String reason;

    @Column(name = "note", length = 1024)
    private String note;

    @Column(name = "at", nullable = false)
    private Instant at;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private HistoryType type;

    @Column(name = "from_value", length = 256)
    private String fromValue;

    @Column(name = "to_value", length = 256)
    private String toValue;

    @Column(name = "details", length = 1024)
    private String details;
}
