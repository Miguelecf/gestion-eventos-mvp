package com.mvp.backend.feature.catalogs.model;

import com.mvp.backend.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "departments",
        uniqueConstraints = @UniqueConstraint(name = "uk_departments_name", columnNames = "name")
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Department extends BaseEntity {

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 7) // ej: #3F51B5
    private String colorHex;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;
}
