package com.seatflow.event.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "zones")
@EqualsAndHashCode(callSuper = false)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ZoneEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "event_id", nullable = false)
    Long eventId;

    @Column(name = "name", nullable = false, length = 100)
    String name;

    @Column(name = "seat_type", nullable = false, length = 20)
    String seatType;

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    BigDecimal price;

    @Column(name = "row_count", nullable = false)
    Integer rowCount;

    @Column(name = "col_count", nullable = false)
    Integer colCount;

    @Column(name = "row_spacing", nullable = false, precision = 6, scale = 2)
    @Builder.Default
    BigDecimal rowSpacing = BigDecimal.valueOf(36);

    @Column(name = "col_spacing", nullable = false, precision = 6, scale = 2)
    @Builder.Default
    BigDecimal colSpacing = BigDecimal.valueOf(32);

    @Column(name = "curve_angle", nullable = false, precision = 6, scale = 2)
    @Builder.Default
    BigDecimal curveAngle = BigDecimal.ZERO;

    @Column(name = "position_x", nullable = false, precision = 8, scale = 2)
    @Builder.Default
    BigDecimal positionX = BigDecimal.ZERO;

    @Column(name = "position_y", nullable = false, precision = 8, scale = 2)
    @Builder.Default
    BigDecimal positionY = BigDecimal.ZERO;

    @Column(name = "rotation", nullable = false, precision = 6, scale = 2)
    @Builder.Default
    BigDecimal rotation = BigDecimal.ZERO;

    @Column(name = "color", length = 20)
    String color;

    @Column(name = "created_at", insertable = false, updatable = false)
    ZonedDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    ZonedDateTime updatedAt;
}
