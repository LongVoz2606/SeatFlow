package com.seatflow.repository;

import com.seatflow.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStatusOrderByEventDateAsc(String status);
}
