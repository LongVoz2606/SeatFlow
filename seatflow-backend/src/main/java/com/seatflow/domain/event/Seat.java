package com.seatflow.domain.event;

import com.seatflow.entity.SeatStatus;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

public record Seat(
    Long id,
    Long eventId,
    String seatNumber,
    String seatRow,
    String seatType,
    BigDecimal price,
    SeatStatus status,
    Long version,
    ZonedDateTime heldUntil,
    Long heldByUserId,
    ZonedDateTime createdAt
) {
}
