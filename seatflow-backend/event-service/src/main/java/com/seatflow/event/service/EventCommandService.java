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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EventCommandService {

    EventRepository eventRepository;
    SeatRepository seatRepository;
    EventQueryService eventQueryService;

    /**
     * Internal API: hold seats (called by booking-service via HTTP).
     */
    @Transactional
    public EventDtos.HoldSeatsResponse holdSeats(Long eventId, EventDtos.HoldSeatsRequest request) {
        EventEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sự kiện ID: " + eventId));

        List<SeatEntity> seats = seatRepository.findByEventIdAndIdIn(eventId, request.seatIds());
        if (seats.size() != request.seatIds().size()) {
            throw new ResourceNotFoundException("Một hoặc nhiều ghế không tồn tại trong sự kiện này.");
        }

        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime expiresAt = now.plusMinutes(request.holdDurationMinutes());

        for (SeatEntity seat : seats) {
            boolean expiredHold = seat.getStatus() == SeatStatus.HELD
                    && seat.getHeldUntil() != null
                    && seat.getHeldUntil().isBefore(now);

            if (seat.getStatus() != SeatStatus.AVAILABLE && !expiredHold) {
                throw new IllegalStateException("Ghế " + seat.getSeatNumber() + " không còn trống.");
            }
            seat.setStatus(SeatStatus.HELD);
            seat.setHeldUntil(expiresAt);
            seat.setHeldByUserId(request.userId());
        }

        seatRepository.saveAll(seats);
        log.info("Held {} seats for userId={} in eventId={}", seats.size(), request.userId(), eventId);

        List<EventDtos.SeatResponse> heldSeats = seats.stream()
                .map(eventQueryService::toSeatResponse).toList();
        return new EventDtos.HoldSeatsResponse(true, heldSeats, "Ghế đã được giữ thành công.");
    }

    /**
     * Internal API: confirm seats (called by booking-service after payment).
     */
    @Transactional
    public void confirmSeats(Long eventId, EventDtos.ConfirmSeatsRequest request) {
        EventEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sự kiện ID: " + eventId));

        List<SeatEntity> seats = seatRepository.findByEventIdAndIdIn(eventId, request.seatIds());
        seats.forEach(seat -> {
            seat.setStatus(SeatStatus.BOOKED);
            seat.setHeldUntil(null);
        });
        seatRepository.saveAll(seats);

        event.setAvailableSeats(Math.max(0, event.getAvailableSeats() - seats.size()));
        eventRepository.save(event);

        log.info("Confirmed {} seats in eventId={}", seats.size(), eventId);
    }
}
