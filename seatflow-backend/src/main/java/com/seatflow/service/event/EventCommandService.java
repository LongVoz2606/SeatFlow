package com.seatflow.service.event;

import com.seatflow.domain.event.Event;
import com.seatflow.repository.database.event.EventEntity;
import com.seatflow.repository.database.event.EventEntityMapper;
import com.seatflow.repository.database.event.EventRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EventCommandService {

    EventRepository eventRepository;
    EventEntityMapper eventEntityMapper;

    protected Event save(Event event) {
        EventEntity entity = eventEntityMapper.toEntity(event);
        EventEntity saved = eventRepository.save(entity);
        return eventEntityMapper.toDomain(saved);
    }
}
