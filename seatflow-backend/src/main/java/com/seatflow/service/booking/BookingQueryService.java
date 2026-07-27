package com.seatflow.service.booking;

import com.seatflow.domain.booking.Booking;
import com.seatflow.domain.event.Seat;
import com.seatflow.repository.database.booking.BookingEntity;
import com.seatflow.repository.database.booking.BookingEntityMapper;
import com.seatflow.repository.database.booking.BookingItemEntity;
import com.seatflow.repository.database.booking.BookingRepository;
import com.seatflow.repository.database.event.EventEntity;
import com.seatflow.repository.database.event.EventRepository;
import com.seatflow.repository.database.event.SeatEntity;
import com.seatflow.repository.database.event.SeatEntityMapper;
import com.seatflow.repository.database.event.SeatRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingQueryService {

    BookingRepository bookingRepository;
    SeatRepository seatRepository;
    EventRepository eventRepository;
    BookingEntityMapper bookingEntityMapper;
    SeatEntityMapper seatEntityMapper;

    public Optional<Booking> findByBookingCode(String bookingCode) {
        return bookingRepository.findByBookingCode(bookingCode).map(this::enrichBooking);
    }

    public Optional<BookingEntity> findRawByBookingCode(String bookingCode) {
        return bookingRepository.findByBookingCode(bookingCode);
    }

    public Optional<BookingEntity> findByIdempotencyKey(String idempotencyKey) {
        return bookingRepository.findByIdempotencyKey(idempotencyKey);
    }

    protected Booking enrichBooking(BookingEntity bookingEntity) {
        List<Long> seatIds = bookingEntity.getItems().stream().map(BookingItemEntity::getSeatId).toList();
        List<SeatEntity> seatEntities = seatRepository.findAllById(seatIds);
        List<Seat> reservedSeats = seatEntities.stream().map(seatEntityMapper::toDomain).toList();

        EventEntity event = eventRepository.findById(bookingEntity.getEventId()).orElse(null);
        String eventTitle = event != null ? event.getTitle() : "";

        return new Booking(
            bookingEntity.getId(),
            bookingEntity.getBookingCode(),
            bookingEntity.getUserId(),
            bookingEntity.getEventId(),
            eventTitle,
            bookingEntity.getStatus(),
            bookingEntity.getTotalAmount(),
            bookingEntity.getIdempotencyKey(),
            bookingEntity.getExpiresAt(),
            reservedSeats,
            bookingEntity.getCreatedAt(),
            bookingEntity.getUpdatedAt()
        );
    }
}
