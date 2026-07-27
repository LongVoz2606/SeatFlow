package com.seatflow.event.repository;

import com.seatflow.event.entity.EventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<EventEntity, Long>, JpaSpecificationExecutor<EventEntity> {

    List<EventEntity> findByStatusOrderByEventDateAsc(String status);

    List<EventEntity> findByOrganizerIdOrderByEventDateDesc(Long organizerId);
}
