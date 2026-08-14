package com.seatflow.event.repository;

import com.seatflow.event.entity.ZoneEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ZoneRepository extends JpaRepository<ZoneEntity, Long> {

    List<ZoneEntity> findByEventIdOrderByIdAsc(Long eventId);
}
