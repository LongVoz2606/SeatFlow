package com.seatflow.service.event;

import com.seatflow.domain.event.Event;
import com.seatflow.domain.event.Seat;
import com.seatflow.repository.database.event.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EventQueryService {

    EventRepository eventRepository;
    SeatRepository seatRepository;
    EventEntityMapper eventEntityMapper;
    SeatEntityMapper seatEntityMapper;

    protected List<Event> findAllActiveEvents() {
        return eventRepository.findByStatusOrderByEventDateAsc("ACTIVE").stream()
                .map(eventEntityMapper::toDomain)
                .toList();
    }

    protected Optional<Event> findByIdWithSeatMap(Long id) {
        return eventRepository.findById(id).map(eventEntity -> {
            List<SeatEntity> seatEntities = seatRepository.findByEventIdOrderBySeatRowAscSeatNumberAsc(id);
            List<Seat> seats = seatEntities.stream().map(seatEntityMapper::toDomain).toList();

            Event event = eventEntityMapper.toDomain(eventEntity);
            return new Event(
                event.id(),
                event.title(),
                event.description(),
                event.location(),
                event.eventDate(),
                event.bannerUrl(),
                event.totalSeats(),
                event.availableSeats(),
                event.status(),
                seats,
                event.createdAt(),
                event.updatedAt()
            );
        });
    }
}
