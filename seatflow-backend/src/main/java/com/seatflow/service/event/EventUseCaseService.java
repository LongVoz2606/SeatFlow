package com.seatflow.service.event;

import com.seatflow.domain.event.Event;
import com.seatflow.domain.event.EventService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EventUseCaseService implements EventService {

    EventQueryService queryService;

    @Override
    @Transactional(readOnly = true)
    public List<Event> findAllActiveEvents() {
        return queryService.findAllActiveEvents();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Event> findByIdWithSeatMap(Long id) {
        return queryService.findByIdWithSeatMap(id);
    }
}
