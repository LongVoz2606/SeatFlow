package com.seatflow.repository.database.event;

import com.seatflow.entity.SeatStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<SeatEntity, Long> {

    List<SeatEntity> findByEventIdOrderBySeatRowAscSeatNumberAsc(Long eventId);

    List<SeatEntity> findByEventIdAndIdIn(Long eventId, List<Long> seatIds);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM SeatEntity s WHERE s.eventId = :eventId AND s.id IN :seatIds")
    List<SeatEntity> findSeatsForUpdate(@Param("eventId") Long eventId, @Param("seatIds") List<Long> seatIds);

    @Query("SELECT s FROM SeatEntity s WHERE s.status = :status AND s.heldUntil < :now")
    List<SeatEntity> findExpiredHeldSeats(@Param("status") SeatStatus status, @Param("now") ZonedDateTime now);
}
