package com.mvp.backend.feature.catalogs.model;

import com.mvp.backend.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "spaces",
        uniqueConstraints = @UniqueConstraint(name = "uk_spaces_name", columnNames = "name")
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Space extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String name;

    private Integer capacity;

    @Builder.Default
    @Column(nullable = false)
    private Integer defaultBufferBeforeMin = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer defaultBufferAfterMin = 0;

    @Column(length = 7)
    private String colorHex;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;
}
