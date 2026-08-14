package com.seatflow.booking.repository;

import com.seatflow.booking.entity.BookingEntity;
import com.seatflow.booking.entity.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<BookingEntity, Long> {

    Optional<BookingEntity> findByBookingCode(String bookingCode);

    Optional<BookingEntity> findByIdempotencyKey(String idempotencyKey);

    List<BookingEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<BookingEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT b FROM BookingEntity b WHERE b.status = :status AND b.expiresAt < :now")
    List<BookingEntity> findExpiredBookings(@Param("status") BookingStatus status, @Param("now") ZonedDateTime now);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM BookingEntity b WHERE b.status = :status")
    BigDecimal sumTotalAmountByStatus(@Param("status") BookingStatus status);

    @Query("SELECT COALESCE(SUM(SIZE(b.items)), 0) FROM BookingEntity b "
            + "WHERE b.userId = :userId AND b.eventId = :eventId AND b.status = :status AND b.expiresAt > :now")
    long countPendingSeatsByUserAndEvent(@Param("userId") Long userId, @Param("eventId") Long eventId,
            @Param("status") BookingStatus status, @Param("now") ZonedDateTime now);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM BookingEntity b WHERE b.eventId = :eventId AND b.status = :status")
    BigDecimal sumTotalAmountByEventIdAndStatus(@Param("eventId") Long eventId, @Param("status") BookingStatus status);

    long countByEventIdAndStatus(Long eventId, BookingStatus status);
}
