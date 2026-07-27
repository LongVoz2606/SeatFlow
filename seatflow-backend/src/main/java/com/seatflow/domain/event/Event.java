package com.seatflow.domain.event;

import java.time.ZonedDateTime;
import java.util.List;

public record Event(
    Long id,
    String title,
    String description,
    String location,
    ZonedDateTime eventDate,
    String bannerUrl,
    Integer totalSeats,
    Integer availableSeats,
    String status,
    List<Seat> seats,
    ZonedDateTime createdAt,
    ZonedDateTime updatedAt
) {
}
