package com.seatflow.domain.booking;

import java.util.List;
import java.util.Optional;

public interface BookingService {
    Booking holdSeats(Long eventId, Long userId, List<Long> seatIds, String idempotencyKey);
    Booking confirmBooking(String bookingCode, Long userId, String paymentMethod);
    Optional<Booking> findByBookingCode(String bookingCode);
}
