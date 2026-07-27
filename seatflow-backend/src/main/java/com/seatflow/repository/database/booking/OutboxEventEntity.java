package com.seatflow.repository.database.booking;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "outbox_events")
@EqualsAndHashCode(callSuper = false)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OutboxEventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "aggregate_type", nullable = false, length = 50)
    String aggregateType;

    @Column(name = "aggregate_id", nullable = false, length = 50)
    String aggregateId;

    @Column(name = "type", nullable = false, length = 50)
    String type;

    @Column(name = "payload", columnDefinition = "TEXT", nullable = false)
    String payload;

    @Column(name = "status", nullable = false, length = 20)
    String status;

    @Column(name = "created_at", insertable = false, updatable = false)
    ZonedDateTime createdAt;
}
