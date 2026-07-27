package com.seatflow.event.service;

import com.seatflow.common.exception.ResourceNotFoundException;
import com.seatflow.event.dto.EventDtos;
import com.seatflow.event.entity.EventEntity;
import com.seatflow.event.entity.SeatEntity;
import com.seatflow.event.entity.SeatStatus;
import com.seatflow.event.repository.EventRepository;
import com.seatflow.event.repository.SeatRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EventQueryService {

    EventRepository eventRepository;
    SeatRepository seatRepository;

    @Transactional(readOnly = true)
    public List<EventDtos.EventResponse> findAllActiveEvents() {
        return eventRepository.findByStatusOrderByEventDateAsc("ACTIVE")
                .stream().map(this::toEventResponse).toList();
    }

    @Transactional(readOnly = true)
    public Optional<EventDtos.EventDetailResponse> findByIdWithSeatMap(Long eventId) {
        return eventRepository.findById(eventId).map(event -> {
            List<SeatEntity> seats = seatRepository.findByEventIdOrderBySeatRowAscSeatNumberAsc(eventId);
            return new EventDtos.EventDetailResponse(
                    event.getId(), event.getTitle(), event.getDescription(),
                    event.getLocation(), event.getEventDate(), event.getBannerUrl(),
                    event.getTotalSeats(), event.getAvailableSeats(), event.getStatus(),
                    seats.stream().map(this::toSeatResponse).toList()
            );
        });
    }

    public EventDtos.EventResponse toEventResponse(EventEntity e) {
        return new EventDtos.EventResponse(
                e.getId(), e.getTitle(), e.getDescription(), e.getLocation(),
                e.getEventDate(), e.getBannerUrl(), e.getTotalSeats(),
                e.getAvailableSeats(), e.getStatus(), e.getCreatedAt()
        );
    }

    public EventDtos.SeatResponse toSeatResponse(SeatEntity s) {
        return new EventDtos.SeatResponse(
                s.getId(), s.getEventId(), s.getSeatNumber(),
                s.getSeatRow(), s.getSeatType(), s.getPrice(), s.getStatus().name()
        );
    }

    /** Release expired holds every 10 seconds */
    @Scheduled(fixedRate = 10000)
    @Transactional
    public void releaseExpiredSeatHolds() {
        List<SeatEntity> expired = seatRepository.findExpiredHeldSeats(SeatStatus.HELD, ZonedDateTime.now());
        if (!expired.isEmpty()) {
            expired.forEach(seat -> {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setHeldUntil(null);
                seat.setHeldByUserId(null);
            });
            seatRepository.saveAll(expired);
            log.info("Released {} expired seat holds", expired.size());
        }
    }
}
