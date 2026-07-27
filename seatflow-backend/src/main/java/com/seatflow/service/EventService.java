package com.seatflow.service;

import com.seatflow.dto.response.EventDto;
import com.seatflow.dto.response.SeatDto;
import com.seatflow.entity.Event;
import com.seatflow.entity.Seat;
import com.seatflow.exception.ResourceNotFoundException;
import com.seatflow.repository.EventRepository;
import com.seatflow.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;

    @Transactional(readOnly = true)
    public List<EventDto> getAllActiveEvents() {
        return eventRepository.findByStatusOrderByEventDateAsc("ACTIVE").stream()
                .map(this::mapToEventDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventDto getEventDetailWithSeatMap(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sự kiện với ID: " + eventId));

        List<Seat> seats = seatRepository.findByEventIdOrderBySeatRowAscSeatNumberAsc(eventId);

        EventDto dto = mapToEventDto(event);
        dto.setSeats(seats.stream().map(this::mapToSeatDto).toList());
        return dto;
    }

    private EventDto mapToEventDto(Event event) {
        return EventDto.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .location(event.getLocation())
                .eventDate(event.getEventDate())
                .bannerUrl(event.getBannerUrl())
                .totalSeats(event.getTotalSeats())
                .availableSeats(event.getAvailableSeats())
                .status(event.getStatus())
                .build();
    }

    private SeatDto mapToSeatDto(Seat seat) {
        return SeatDto.builder()
                .id(seat.getId())
                .eventId(seat.getEventId())
                .seatNumber(seat.getSeatNumber())
                .seatRow(seat.getSeatRow())
                .seatType(seat.getSeatType())
                .price(seat.getPrice())
                .status(seat.getStatus())
                .heldUntil(seat.getHeldUntil())
                .heldByUserId(seat.getHeldByUserId())
                .build();
    }
}
