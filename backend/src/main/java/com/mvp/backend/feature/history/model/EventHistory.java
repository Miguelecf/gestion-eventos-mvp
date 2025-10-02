package com.mvp.backend.feature.history.model;

import com.mvp.backend.feature.events.model.Event;
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

    @Column(name = "at", nullable = false)
    private Instant at;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private HistoryType type;

    @Column(name = "from_value", length = 120)
    private String fromValue;

    @Column(name = "to_value", length = 120)
    private String toValue;

    @Column(name = "details", length = 255)
    private String details;
}