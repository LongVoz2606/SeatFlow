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
@Table(name = "events")
@EqualsAndHashCode(callSuper = false)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "title", nullable = false)
    String title;

    @Column(name = "description", columnDefinition = "TEXT")
    String description;

    @Column(name = "location", nullable = false)
    String location;

    @Column(name = "event_date", nullable = false)
    ZonedDateTime eventDate;

    @Column(name = "banner_url", length = 500)
    String bannerUrl;

    @Column(name = "total_seats", nullable = false)
    Integer totalSeats;

    @Column(name = "available_seats", nullable = false)
    Integer availableSeats;

    @Column(name = "status", nullable = false, length = 20)
    String status;

    @Column(name = "rejection_reason", length = 500)
    String rejectionReason;

    @Column(name = "organizer_id")
    Long organizerId;

    @Column(name = "is_hot", nullable = false)
    @Builder.Default
    Boolean isHot = false;

    @Column(name = "min_price", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    BigDecimal minPrice = BigDecimal.ZERO;

    @Column(name = "max_price", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    BigDecimal maxPrice = BigDecimal.ZERO;

    @Column(name = "category", nullable = false, length = 50)
    @Builder.Default
    String category = "Music";

    @Column(name = "created_at", insertable = false, updatable = false)
    ZonedDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    ZonedDateTime updatedAt;
}
