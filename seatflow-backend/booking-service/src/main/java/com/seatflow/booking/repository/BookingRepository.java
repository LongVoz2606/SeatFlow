package com.seatflow.booking.repository;

import com.seatflow.booking.entity.BookingEntity;
import com.seatflow.booking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<BookingEntity, Long> {

    Optional<BookingEntity> findByBookingCode(String bookingCode);

    Optional<BookingEntity> findByIdempotencyKey(String idempotencyKey);

    List<BookingEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT b FROM BookingEntity b WHERE b.status = :status AND b.expiresAt < :now")
    List<BookingEntity> findExpiredBookings(@Param("status") BookingStatus status, @Param("now") ZonedDateTime now);
}
