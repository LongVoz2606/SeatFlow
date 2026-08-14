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
@Table(name = "seats", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"event_id", "seat_number"})
})
@EqualsAndHashCode(callSuper = false)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SeatEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "event_id", nullable = false)
    Long eventId;

    /** NULL cho ghế kiểu cũ (tạo bằng seatSections thẳng hàng, không thuộc zone tùy biến). */
    @Column(name = "zone_id")
    Long zoneId;

    @Column(name = "row_index")
    Integer rowIndex;

    @Column(name = "col_index")
    Integer colIndex;

    @Column(name = "seat_number", nullable = false, length = 20)
    String seatNumber;

    @Column(name = "seat_row", nullable = false, length = 10)
    String seatRow;

    @Column(name = "seat_type", nullable = false, length = 20)
    String seatType;

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    SeatStatus status;

    @Version
    @Column(name = "version", nullable = false)
    Long version;

    @Column(name = "held_until")
    ZonedDateTime heldUntil;

    @Column(name = "held_by_user_id")
    Long heldByUserId;

    @Column(name = "created_at", insertable = false, updatable = false)
    ZonedDateTime createdAt;
}
