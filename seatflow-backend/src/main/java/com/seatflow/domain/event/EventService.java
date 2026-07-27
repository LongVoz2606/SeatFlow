package com.seatflow.domain.event;

import java.util.List;
import java.util.Optional;

public interface EventService {
    List<Event> findAllActiveEvents();
    Optional<Event> findByIdWithSeatMap(Long id);
}
