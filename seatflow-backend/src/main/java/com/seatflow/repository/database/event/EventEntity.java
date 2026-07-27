package com.seatflow.repository.database.event;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

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

    @Column(name = "created_at", insertable = false, updatable = false)
    ZonedDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    ZonedDateTime updatedAt;
}
