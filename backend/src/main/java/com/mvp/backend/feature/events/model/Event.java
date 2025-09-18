package com.mvp.backend.feature.events.model;


import com.mvp.backend.feature.users.model.User;
import com.mvp.backend.shared.BaseEntity;
import com.mvp.backend.shared.Priority;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event extends BaseEntity {

    @Column(nullable = false)
    private LocalDate date;

    @Column
    private LocalTime technicalSchedule; //horario técnico

    @Column
    private LocalTime scheduleFrom;

    @Column
    private LocalTime scheduleTo;

    @Enumerated(EnumType.STRING)
    @Column(length = 20,nullable = false)
    private Status status;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 150)
    private String requestingArea;

    @Column(length = 255)
    private String requirements;

    @Column(columnDefinition = "TEXT")
    private String coverage;

    @Column(nullable = false)
    private Instant requestDate;

    @Column(columnDefinition = "TEXT")
    private String observations;

    //Priority con el enum ya definido
    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private Priority priority;

    //Relación con el usuario
    @ManyToOne(optional = false)
    @JoinColumn(name="user_id",nullable=false)
    private User user;


}
