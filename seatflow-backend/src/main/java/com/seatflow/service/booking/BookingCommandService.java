package com.seatflow.service.booking;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seatflow.entity.SeatStatus;
import com.seatflow.repository.database.booking.BookingEntity;
import com.seatflow.repository.database.booking.BookingItemEntity;
import com.seatflow.repository.database.booking.BookingRepository;
import com.seatflow.repository.database.booking.OutboxEventEntity;
import com.seatflow.repository.database.booking.OutboxEventRepository;
import com.seatflow.repository.database.event.EventEntity;
import com.seatflow.repository.database.event.EventRepository;
import com.seatflow.repository.database.event.SeatEntity;
import com.seatflow.repository.database.event.SeatRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookingCommandService {

    BookingRepository bookingRepository;
    SeatRepository seatRepository;
    EventRepository eventRepository;
    OutboxEventRepository outboxEventRepository;
    ObjectMapper objectMapper;

    protected BookingEntity createBookingHold(EventEntity event, List<SeatEntity> seats, Long userId, String idempotencyKey, int holdDurationMinutes) {
        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime expiresAt = now.plusMinutes(holdDurationMinutes);
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (SeatEntity seat : seats) {
            seat.setStatus(SeatStatus.HELD);
            seat.setHeldUntil(expiresAt);
            seat.setHeldByUserId(userId);
            totalAmount = totalAmount.add(seat.getPrice());
        }
        seatRepository.saveAll(seats);

        String bookingCode = "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        BookingEntity booking = BookingEntity.builder()
                .bookingCode(bookingCode)
                .userId(userId)
                .eventId(event.getId())
                .status(com.seatflow.entity.BookingStatus.PENDING)
                .totalAmount(totalAmount)
                .idempotencyKey(idempotencyKey)
                .expiresAt(expiresAt)
                .build();

        List<BookingItemEntity> items = seats.stream().map(seat -> BookingItemEntity.builder()
                .booking(booking)
                .seatId(seat.getId())
                .price(seat.getPrice())
                .build()).toList();
        booking.setItems(items);

        BookingEntity savedBooking = bookingRepository.save(booking);
        log.info("Held {} seats for user {} with bookingCode: {}", seats.size(), userId, bookingCode);

        return savedBooking;
    }

    protected BookingEntity saveConfirmedBooking(BookingEntity booking, List<SeatEntity> seats, EventEntity event) {
        for (SeatEntity seat : seats) {
            seat.setStatus(SeatStatus.BOOKED);
            seat.setHeldUntil(null);
        }
        seatRepository.saveAll(seats);

        booking.setStatus(com.seatflow.entity.BookingStatus.CONFIRMED);
        BookingEntity updatedBooking = bookingRepository.save(booking);

        if (event != null) {
            event.setAvailableSeats(Math.max(0, event.getAvailableSeats() - seats.size()));
            eventRepository.save(event);
        }

        log.info("Confirmed booking {}", updatedBooking.getBookingCode());
        return updatedBooking;
    }

    protected void saveOutboxEvent(String aggregateType, String aggregateId, String type, Object payloadData) {
        try {
            String payloadStr = objectMapper.writeValueAsString(payloadData);
            OutboxEventEntity outbox = OutboxEventEntity.builder()
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
}
