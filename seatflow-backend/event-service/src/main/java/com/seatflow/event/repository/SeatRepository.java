package com.seatflow.event.repository;

import com.seatflow.event.entity.SeatEntity;
import com.seatflow.event.entity.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<SeatEntity, Long> {

    List<SeatEntity> findByEventIdOrderBySeatRowAscSeatNumberAsc(Long eventId);

    @Query("SELECT s FROM SeatEntity s WHERE s.eventId = :eventId AND s.id IN :ids")
    List<SeatEntity> findByEventIdAndIdIn(@Param("eventId") Long eventId, @Param("ids") List<Long> ids);

    @Query("SELECT s FROM SeatEntity s WHERE s.status = :status AND s.heldUntil IS NOT NULL AND s.heldUntil < :now")
    List<SeatEntity> findExpiredHeldSeats(@Param("status") SeatStatus status, @Param("now") ZonedDateTime now);
}
