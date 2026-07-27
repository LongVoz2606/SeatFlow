package com.seatflow.repository;

import com.seatflow.entity.Seat;
import com.seatflow.entity.SeatStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.ZonedDateTime;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByEventIdOrderBySeatRowAscSeatNumberAsc(Long eventId);

    List<Seat> findByEventIdAndIdIn(Long eventId, List<Long> seatIds);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.eventId = :eventId AND s.id IN :seatIds")
    List<Seat> findSeatsForUpdate(@Param("eventId") Long eventId, @Param("seatIds") List<Long> seatIds);

    @Query("SELECT s FROM Seat s WHERE s.status = :status AND s.heldUntil < :now")
    List<Seat> findExpiredHeldSeats(@Param("status") SeatStatus status, @Param("now") ZonedDateTime now);
}
