package com.mvp.backend.feature.tech.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tech_capacity_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechCapacityConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "block_minutes", nullable = false)
    private int blockMinutes = 30;

    @Column(name = "default_slots_per_block", nullable = false)
    private int defaultSlotsPerBlock = 10;

    @Column(length = 60)
    private String timezone;

    @Column(length = 255)
    private String notes;
}