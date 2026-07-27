package com.seatflow.repository;

import com.seatflow.entity.Booking;
import com.seatflow.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingCode(String bookingCode);

    Optional<Booking> findByIdempotencyKey(String idempotencyKey);

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT b FROM Booking b WHERE b.status = :status AND b.expiresAt < :now")
    List<Booking> findExpiredBookings(@Param("status") BookingStatus status, @Param("now") ZonedDateTime now);
}
