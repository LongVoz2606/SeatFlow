package com.seatflow.event.repository;

import com.seatflow.event.entity.EventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<EventEntity, Long>, JpaSpecificationExecutor<EventEntity> {

    List<EventEntity> findByOrganizerIdAndParentEventIdIsNullOrderByEventDateDesc(Long organizerId);

    List<EventEntity> findByParentEventIdOrderByEventDateAsc(Long parentEventId);

    boolean existsByParentEventId(Long parentEventId);

    List<EventEntity> findByStatusAndParentEventIdIsNullOrderByEventDateAsc(String status);

    @Query("SELECT e.parentEventId, COUNT(e) FROM EventEntity e WHERE e.parentEventId IN :parentIds GROUP BY e.parentEventId")
    List<Object[]> countSessionsByParentIds(@Param("parentIds") List<Long> parentIds);
}
