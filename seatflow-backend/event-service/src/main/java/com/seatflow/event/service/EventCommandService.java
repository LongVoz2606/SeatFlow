package com.seatflow.event.service;

import com.seatflow.common.exception.ResourceNotFoundException;
import com.seatflow.common.exception.UnauthorizedException;
import com.seatflow.event.dto.EventDtos;
import com.seatflow.event.entity.EventEntity;
import com.seatflow.event.entity.OrganizerEntity;
import com.seatflow.event.entity.OrganizerStatus;
import com.seatflow.event.entity.SeatEntity;
import com.seatflow.event.entity.SeatStatus;
import com.seatflow.event.repository.EventRepository;
import com.seatflow.event.repository.OrganizerRepository;
import com.seatflow.event.repository.SeatRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EventCommandService {

    EventRepository eventRepository;
    SeatRepository seatRepository;
    OrganizerRepository organizerRepository;
    EventQueryService eventQueryService;

    /**
     * Organizer (đã được Admin duyệt) tạo sự kiện mới kèm các khu vực ghế.
     */
    @Transactional
    public Long createEvent(Long authUserId, EventDtos.CreateEventRequest request) {
        OrganizerEntity organizer = organizerRepository.findByAuthUserId(authUserId)
                .orElseThrow(() -> new UnauthorizedException("Bạn cần đăng ký làm nhà tổ chức trước khi tạo sự kiện."));
        if (organizer.getStatus() != OrganizerStatus.APPROVED) {
            throw new UnauthorizedException("Hồ sơ nhà tổ chức của bạn chưa được Admin duyệt.");
        }

        List<SeatEntity> seatsToCreate = new ArrayList<>();
        BigDecimal minPrice = null;
        BigDecimal maxPrice = null;
        int totalSeats = 0;

        for (EventDtos.SeatSectionRequest section : request.seatSections()) {
            for (int i = 1; i <= section.seatCount(); i++) {
                SeatEntity seat = SeatEntity.builder()
                        .seatNumber(section.rowLabel() + i)
                        .seatRow(section.rowLabel())
                        .seatType(section.seatType())
                        .price(section.price())
                        .status(SeatStatus.AVAILABLE)
                        .version(0L)
                        .build();
                seatsToCreate.add(seat);
            }
            totalSeats += section.seatCount();
            minPrice = minPrice == null || section.price().compareTo(minPrice) < 0 ? section.price() : minPrice;
            maxPrice = maxPrice == null || section.price().compareTo(maxPrice) > 0 ? section.price() : maxPrice;
        }

        EventEntity event = EventEntity.builder()
                .title(request.title())
                .description(request.description())
                .location(request.location())
                .eventDate(request.eventDate())
                .bannerUrl(request.bannerUrl())
                .category(request.category() != null ? request.category() : "Music")
                .totalSeats(totalSeats)
                .availableSeats(totalSeats)
                .status("ACTIVE")
                .organizerId(organizer.getId())
                .isHot(false)
                .minPrice(minPrice != null ? minPrice : BigDecimal.ZERO)
                .maxPrice(maxPrice != null ? maxPrice : BigDecimal.ZERO)
                .build();
        EventEntity saved = eventRepository.save(event);

        seatsToCreate.forEach(s -> s.setEventId(saved.getId()));
        seatRepository.saveAll(seatsToCreate);

        log.info("Organizer {} created event '{}' (id={}) with {} seats", organizer.getId(), saved.getTitle(), saved.getId(), totalSeats);
        return saved.getId();
    }

    /**
     * Admin gắn/gỡ cờ "HOT" cho sự kiện để nổi bật ở trang chủ.
     */
    @Transactional
    public void setHot(Long eventId, boolean hot) {
        EventEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sự kiện ID: " + eventId));
        event.setIsHot(hot);
        eventRepository.save(event);
    }

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
