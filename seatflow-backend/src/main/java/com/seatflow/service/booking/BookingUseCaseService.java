package com.seatflow.service.booking;

import com.seatflow.bootstrap.constants.ErrorCodes;
import com.seatflow.domain.booking.Booking;
import com.seatflow.domain.booking.BookingService;
import com.seatflow.entity.BookingStatus;
import com.seatflow.entity.SeatStatus;
import com.seatflow.exception.IdempotencyException;
import com.seatflow.exception.ResourceNotFoundException;
import com.seatflow.exception.SeatUnavailableException;
import com.seatflow.repository.database.booking.BookingEntity;
import com.seatflow.repository.database.booking.BookingRepository;
import com.seatflow.repository.database.event.EventEntity;
import com.seatflow.repository.database.event.EventRepository;
import com.seatflow.repository.database.event.SeatEntity;
import com.seatflow.repository.database.event.SeatRepository;
import com.seatflow.service.RedissonLockService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class BookingUseCaseService implements BookingService {

    final BookingCommandService commandService;
    final BookingQueryService queryService;
    final EventRepository eventRepository;
    final SeatRepository seatRepository;
    final BookingRepository bookingRepository;
    final RedissonLockService redissonLockService;

    @Value("${seatflow.booking.hold-duration-minutes:5}")
    int holdDurationMinutes;

    @Override
    @Transactional
    public Booking holdSeats(Long eventId, Long userId, List<Long> seatIds, String idempotencyKey) {
        if (StringUtils.hasText(idempotencyKey)) {
            queryService.findByIdempotencyKey(idempotencyKey).ifPresent(existing -> {
                throw new IdempotencyException(ErrorCodes.IDEMPOTENCY_CONFLICT.getMessage());
            });
        }

        EventEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCodes.EVENT_NOT_FOUND.getMessage()));

        String lockKey = "seat_lock_event_%d_%d".formatted(eventId, seatIds.hashCode());

        return redissonLockService.executeWithLock(lockKey, 5, 10, () -> {
            List<SeatEntity> seats = seatRepository.findByEventIdAndIdIn(eventId, seatIds);
            if (seats.size() != seatIds.size()) {
                throw new ResourceNotFoundException(ErrorCodes.RESOURCE_NOT_FOUND.getMessage());
            }

            ZonedDateTime now = ZonedDateTime.now();
            for (SeatEntity seat : seats) {
                boolean isExpiredHold = seat.getStatus() == SeatStatus.HELD && seat.getHeldUntil() != null && seat.getHeldUntil().isBefore(now);
                if (seat.getStatus() != SeatStatus.AVAILABLE && !isExpiredHold) {
                    throw new SeatUnavailableException(ErrorCodes.SEAT_UNAVAILABLE.formatMessage(seat.getSeatNumber()));
                }
            }

            BookingEntity savedBooking = commandService.createBookingHold(event, seats, userId, idempotencyKey, holdDurationMinutes);

            commandService.saveOutboxEvent("BOOKING", savedBooking.getBookingCode(), "SEAT_HELD", Map.of(
                    "bookingCode", savedBooking.getBookingCode(),
                    "userId", savedBooking.getUserId(),
                    "eventId", savedBooking.getEventId(),
                    "seatIds", seatIds,
                    "expiresAt", savedBooking.getExpiresAt().toString()
            ));

            return queryService.enrichBooking(savedBooking);
        });
    }

    @Override
    @Transactional
    public Booking confirmBooking(String bookingCode, Long userId, String paymentMethod) {
        BookingEntity booking = queryService.findRawByBookingCode(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCodes.BOOKING_NOT_FOUND.getMessage()));

        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            return queryService.enrichBooking(booking);
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException(ErrorCodes.INVALID_BOOKING_STATUS.getMessage());
        }

        if (booking.getExpiresAt().isBefore(ZonedDateTime.now())) {
            booking.setStatus(BookingStatus.EXPIRED);
            bookingRepository.save(booking);
            throw new IllegalStateException(ErrorCodes.BOOKING_EXPIRED.getMessage());
        }

        List<Long> seatIds = booking.getItems().stream().map(item -> item.getSeatId()).toList();
        List<SeatEntity> seats = seatRepository.findByEventIdAndIdIn(booking.getEventId(), seatIds);
        EventEntity event = eventRepository.findById(booking.getEventId()).orElse(null);

        BookingEntity updated = commandService.saveConfirmedBooking(booking, seats, event);

        commandService.saveOutboxEvent("BOOKING", updated.getBookingCode(), "BOOKING_CONFIRMED", Map.of(
                "bookingCode", updated.getBookingCode(),
                "userId", updated.getUserId(),
                "totalAmount", updated.getTotalAmount()
        ));

        return queryService.enrichBooking(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Booking> findByBookingCode(String bookingCode) {
        return queryService.findByBookingCode(bookingCode);
    }

    @Scheduled(fixedRate = 10000)
    @Transactional
    public void releaseExpiredSeatHolds() {
        ZonedDateTime now = ZonedDateTime.now();
        List<SeatEntity> expiredSeats = seatRepository.findExpiredHeldSeats(SeatStatus.HELD, now);
        if (!expiredSeats.isEmpty()) {
            for (SeatEntity seat : expiredSeats) {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setHeldUntil(null);
                seat.setHeldByUserId(null);
            }
            seatRepository.saveAll(expiredSeats);
            log.info("Released {} expired held seats back to AVAILABLE", expiredSeats.size());
        }

        List<BookingEntity> expiredBookings = bookingRepository.findExpiredBookings(BookingStatus.PENDING, now);
        if (!expiredBookings.isEmpty()) {
            for (BookingEntity b : expiredBookings) {
                b.setStatus(BookingStatus.EXPIRED);
            }
            bookingRepository.saveAll(expiredBookings);
            log.info("Marked {} pending bookings as EXPIRED", expiredBookings.size());
        }
    }
}
