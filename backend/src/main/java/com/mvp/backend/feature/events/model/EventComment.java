package com.mvp.backend.feature.events.model;


import com.mvp.backend.feature.users.model.User;
import com.mvp.backend.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "event_comments",
        indexes = {
                @Index(name = "ix_event_comments_event", columnList = "event_id")
        }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EventComment extends BaseEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(optional = false)
    @JoinColumn(name = "author_user_id", nullable = false)
    private User author;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Builder.Default
    @Column(nullable = false)
    private boolean internalVisible = true; // por ahora, solo internos
}