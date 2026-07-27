package com.seatflow.domain.booking;

import com.seatflow.domain.event.Seat;
import com.seatflow.entity.BookingStatus;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

public record Booking(
    Long id,
    String bookingCode,
    Long userId,
    Long eventId,
    String eventTitle,
    BookingStatus status,
    BigDecimal totalAmount,
    String idempotencyKey,
    ZonedDateTime expiresAt,
    List<Seat> reservedSeats,
    ZonedDateTime createdAt,
    ZonedDateTime updatedAt
) {
}
