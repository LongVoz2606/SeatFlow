package com.seatflow.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seatflow.dto.request.ConfirmBookingRequest;
import com.seatflow.dto.request.HoldSeatRequest;
import com.seatflow.dto.response.BookingDto;
import com.seatflow.dto.response.SeatDto;
import com.seatflow.entity.*;
import com.seatflow.exception.IdempotencyException;
import com.seatflow.exception.ResourceNotFoundException;
import com.seatflow.exception.SeatUnavailableException;
import com.seatflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatBookingService {

    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final RedissonLockService redissonLockService;
    private final ObjectMapper objectMapper;

    @Value("${seatflow.booking.hold-duration-minutes:5}")
    private int holdDurationMinutes;

    @Transactional
    public BookingDto holdSeats(HoldSeatRequest request, String idempotencyKey) {
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            bookingRepository.findByIdempotencyKey(idempotencyKey).ifPresent(existing -> {
                throw new IdempotencyException("Yêu cầu này đã được xử lý trước đó với mã: " + existing.getBookingCode());
            });
        }

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sự kiện ID: " + request.getEventId()));

        List<Long> seatIds = request.getSeatIds();

        // Distributed Lock across seat IDs
        String lockKey = "seat_lock_event_" + request.getEventId() + "_" + seatIds.hashCode();

        return redissonLockService.executeWithLock(lockKey, 5, 10, () -> {
            List<Seat> seats = seatRepository.findByEventIdAndIdIn(request.getEventId(), seatIds);
            if (seats.size() != seatIds.size()) {
                throw new ResourceNotFoundException("Một số ghế bạn chọn không tồn tại.");
            }

            ZonedDateTime now = ZonedDateTime.now();
            for (Seat seat : seats) {
                boolean isExpiredHold = seat.getStatus() == SeatStatus.HELD && seat.getHeldUntil() != null && seat.getHeldUntil().isBefore(now);
                if (seat.getStatus() != SeatStatus.AVAILABLE && !isExpiredHold) {
                    throw new SeatUnavailableException("Ghế " + seat.getSeatNumber() + " đang được giữ hoặc đã bán.");
                }
            }

            ZonedDateTime expiresAt = now.plusMinutes(holdDurationMinutes);
            BigDecimal totalAmount = BigDecimal.ZERO;

            for (Seat seat : seats) {
                seat.setStatus(SeatStatus.HELD);
                seat.setHeldUntil(expiresAt);
                seat.setHeldByUserId(request.getUserId());
                totalAmount = totalAmount.add(seat.getPrice());
            }
            seatRepository.saveAll(seats);

            String bookingCode = "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            Booking booking = Booking.builder()
                    .bookingCode(bookingCode)
                    .userId(request.getUserId())
                    .eventId(event.getId())
                    .status(BookingStatus.PENDING)
                    .totalAmount(totalAmount)
                    .idempotencyKey(idempotencyKey)
                    .expiresAt(expiresAt)
                    .build();

            List<BookingItem> items = seats.stream().map(seat -> BookingItem.builder()
                    .booking(booking)
                    .seatId(seat.getId())
                    .price(seat.getPrice())
                    .build()).toList();
            booking.setItems(items);

            Booking savedBooking = bookingRepository.save(booking);

            // Save Outbox Event
            saveOutboxEvent("BOOKING", savedBooking.getBookingCode(), "SEAT_HELD", Map.of(
                    "bookingCode", savedBooking.getBookingCode(),
                    "userId", savedBooking.getUserId(),
                    "eventId", savedBooking.getEventId(),
                    "seatIds", seatIds,
                    "expiresAt", expiresAt.toString()
            ));

            log.info("Held {} seats for user {} with bookingCode: {}", seatIds.size(), request.getUserId(), bookingCode);

            return mapToBookingDto(savedBooking, event.getTitle(), seats);
        });
    }

    @Transactional
    public BookingDto confirmBooking(ConfirmBookingRequest request) {
        Booking booking = bookingRepository.findByBookingCode(request.getBookingCode())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt vé: " + request.getBookingCode()));

        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            return getBookingByCode(request.getBookingCode());
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Đơn đặt vé ở trạng thái không hợp lệ: " + booking.getStatus());
        }

        if (booking.getExpiresAt().isBefore(ZonedDateTime.now())) {
            booking.setStatus(BookingStatus.EXPIRED);
            bookingRepository.save(booking);
            throw new IllegalStateException("Thời gian giữ ghế đã hết hạn.");
        }

        List<Long> seatIds = booking.getItems().stream().map(BookingItem::getSeatId).toList();
        List<Seat> seats = seatRepository.findByEventIdAndIdIn(booking.getEventId(), seatIds);

        for (Seat seat : seats) {
            seat.setStatus(SeatStatus.BOOKED);
            seat.setHeldUntil(null);
        }
        seatRepository.saveAll(seats);

        booking.setStatus(BookingStatus.CONFIRMED);
        Booking updatedBooking = bookingRepository.save(booking);

        Event event = eventRepository.findById(booking.getEventId()).orElse(null);
        if (event != null) {
            event.setAvailableSeats(Math.max(0, event.getAvailableSeats() - seats.size()));
            eventRepository.save(event);
        }

        saveOutboxEvent("BOOKING", updatedBooking.getBookingCode(), "BOOKING_CONFIRMED", Map.of(
                "bookingCode", updatedBooking.getBookingCode(),
                "userId", updatedBooking.getUserId(),
                "totalAmount", updatedBooking.getTotalAmount()
        ));

        log.info("Confirmed booking {}", updatedBooking.getBookingCode());

        return mapToBookingDto(updatedBooking, event != null ? event.getTitle() : "Event", seats);
    }

    @Transactional(readOnly = true)
    public BookingDto getBookingByCode(String bookingCode) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt vé: " + bookingCode));
        List<Long> seatIds = booking.getItems().stream().map(BookingItem::getSeatId).toList();
        List<Seat> seats = seatRepository.findAllById(seatIds);
        Event event = eventRepository.findById(booking.getEventId()).orElse(null);
        return mapToBookingDto(booking, event != null ? event.getTitle() : "", seats);
    }

    @Scheduled(fixedRate = 10000)
    @Transactional
    public void releaseExpiredSeatHolds() {
        ZonedDateTime now = ZonedDateTime.now();
        List<Seat> expiredSeats = seatRepository.findExpiredHeldSeats(SeatStatus.HELD, now);
        if (!expiredSeats.isEmpty()) {
            for (Seat seat : expiredSeats) {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setHeldUntil(null);
                seat.setHeldByUserId(null);
            }
            seatRepository.saveAll(expiredSeats);
            log.info("Released {} expired held seats back to AVAILABLE", expiredSeats.size());
        }

        List<Booking> expiredBookings = bookingRepository.findExpiredBookings(BookingStatus.PENDING, now);
        if (!expiredBookings.isEmpty()) {
            for (Booking b : expiredBookings) {
                b.setStatus(BookingStatus.EXPIRED);
            }
            bookingRepository.saveAll(expiredBookings);
            log.info("Marked {} pending bookings as EXPIRED", expiredBookings.size());
        }
    }

    private void saveOutboxEvent(String aggregateType, String aggregateId, String type, Object payloadData) {
        try {
            String payloadStr = objectMapper.writeValueAsString(payloadData);
            OutboxEvent outbox = OutboxEvent.builder()
                    .aggregateType(aggregateType)
                    .aggregateId(aggregateId)
                    .type(type)
                    .payload(payloadStr)
                    .status("PENDING")
                    .build();
            outboxEventRepository.save(outbox);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize outbox event payload", e);
        }
    }

    private BookingDto mapToBookingDto(Booking booking, String eventTitle, List<Seat> seats) {
        List<SeatDto> seatDtos = seats.stream().map(s -> SeatDto.builder()
                .id(s.getId())
                .eventId(s.getEventId())
                .seatNumber(s.getSeatNumber())
                .seatRow(s.getSeatRow())
                .seatType(s.getSeatType())
                .price(s.getPrice())
                .status(s.getStatus())
                .build()).toList();

        return BookingDto.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .userId(booking.getUserId())
                .eventId(booking.getEventId())
                .eventTitle(eventTitle)
                .status(booking.getStatus())
                .totalAmount(booking.getTotalAmount())
                .expiresAt(booking.getExpiresAt())
                .createdAt(booking.getCreatedAt())
                .reservedSeats(seatDtos)
                .build();
    }
}
