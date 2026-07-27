package com.seatflow.domain.booking;

import java.math.BigDecimal;

public record BookingItem(
    Long id,
    Long bookingId,
    Long seatId,
    BigDecimal price
) {
}
