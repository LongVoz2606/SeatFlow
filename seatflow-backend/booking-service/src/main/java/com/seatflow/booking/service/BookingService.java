package com.seatflow.booking.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seatflow.booking.client.EventServiceClient;
import com.seatflow.booking.dto.BookingDtos;
import com.seatflow.booking.entity.BookingEntity;
import com.seatflow.booking.entity.BookingItemEntity;
import com.seatflow.booking.entity.BookingStatus;
import com.seatflow.booking.entity.OutboxEventEntity;
import com.seatflow.booking.repository.BookingRepository;
import com.seatflow.booking.repository.OutboxEventRepository;
import com.seatflow.common.exception.BusinessException;
import com.seatflow.common.exception.ResourceNotFoundException;
import com.seatflow.common.exception.UnauthorizedException;
import com.seatflow.common.response.ApiResponse;
import com.seatflow.common.response.PageResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class BookingService {

    final BookingRepository bookingRepository;
    final OutboxEventRepository outboxEventRepository;
    final EventServiceClient eventServiceClient;
    final ObjectMapper objectMapper;

    @Value("${seatflow.booking.hold-duration-minutes:5}")
    int holdDurationMinutes;

    @Value("${seatflow.booking.max-pending-seats-per-user-event:8}")
    int maxPendingSeatsPerUserEvent;

    @Transactional
    public BookingDtos.BookingResponse holdSeats(BookingDtos.HoldSeatsRequest request, Long authenticatedUserId) {
        if (authenticatedUserId == null) {
            throw new UnauthorizedException("Bạn cần đăng nhập để giữ ghế.");
        }
        Long userId = authenticatedUserId;

        // Idempotency check
        if (StringUtils.hasText(request.idempotencyKey())) {
            Optional<BookingEntity> existing = bookingRepository.findByIdempotencyKey(request.idempotencyKey());
            if (existing.isPresent()) {
                throw new BusinessException("IDEMPOTENCY_CONFLICT", "Yêu cầu này đã được hệ thống xử lý trước đó.");
            }
        }

        // Chặn 1 user giữ quá nhiều ghế PENDING cùng lúc cho 1 sự kiện (chống seat-squatting)
        long alreadyHeld = bookingRepository.countPendingSeatsByUserAndEvent(
                userId, request.eventId(), BookingStatus.PENDING, ZonedDateTime.now());
        if (alreadyHeld + request.seatIds().size() > maxPendingSeatsPerUserEvent) {
            throw new BusinessException("SEAT_LIMIT_EXCEEDED",
                    "Bạn chỉ được giữ tối đa " + maxPendingSeatsPerUserEvent
                            + " ghế đang chờ thanh toán cho sự kiện này. Vui lòng thanh toán hoặc chờ hết hạn giữ chỗ trước khi giữ thêm.");
        }

        // Call event-service to hold seats
        ApiResponse<EventServiceClient.HoldSeatsResponse> response = eventServiceClient.holdSeats(
                request.eventId(),
                new EventServiceClient.HoldSeatsRequest(userId, request.seatIds(), holdDurationMinutes)
        );

        if (response.getData() == null || !response.getData().success()) {
            throw new BusinessException("SEAT_UNAVAILABLE", "Không thể giữ ghế. Vui lòng thử lại.");
        }

        // Create booking record
        ZonedDateTime expiresAt = ZonedDateTime.now().plusMinutes(holdDurationMinutes);
        BigDecimal totalAmount = response.getData().heldSeats().stream()
                .map(EventServiceClient.SeatResponse::price)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String bookingCode = "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        BookingEntity booking = BookingEntity.builder()
                .bookingCode(bookingCode)
                .userId(userId)
                .eventId(request.eventId())
                .status(BookingStatus.PENDING)
                .totalAmount(totalAmount)
                .idempotencyKey(request.idempotencyKey())
                .expiresAt(expiresAt)
                .build();

        List<BookingItemEntity> items = request.seatIds().stream()
                .map(seatId -> {
                    BigDecimal price = response.getData().heldSeats().stream()
                            .filter(s -> s.id().equals(seatId))
                            .map(EventServiceClient.SeatResponse::price)
                            .findFirst().orElse(BigDecimal.ZERO);
                    return BookingItemEntity.builder()
                            .booking(booking)
                            .seatId(seatId)
                            .price(price)
                            .build();
                }).toList();
        booking.setItems(items);

        BookingEntity saved = bookingRepository.save(booking);
        log.info("Booking created: {} for userId={}", bookingCode, userId);

        // Outbox event
        saveOutboxEvent("BOOKING", bookingCode, "SEAT_HELD", Map.of(
                "bookingCode", bookingCode, "userId", userId,
                "eventId", request.eventId(), "seatIds", request.seatIds(),
                "totalAmount", totalAmount
        ));

        return toResponse(saved, response.getData().heldSeats(), "");
    }

    @Transactional
    public BookingDtos.BookingResponse confirmBooking(String bookingCode, Long authenticatedUserId, String paymentMethod) {
        if (authenticatedUserId == null) {
            throw new UnauthorizedException("Bạn cần đăng nhập để xác nhận booking.");
        }
        BookingEntity booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt vé: " + bookingCode));

        if (!booking.getUserId().equals(authenticatedUserId)) {
            throw new UnauthorizedException("Bạn không có quyền xác nhận đơn đặt vé này.");
        }

        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            return findByBookingCode(bookingCode).orElse(toResponse(booking, List.of(), ""));
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Đơn đặt vé ở trạng thái không hợp lệ: " + booking.getStatus());
        }
        if (booking.getExpiresAt().isBefore(ZonedDateTime.now())) {
            booking.setStatus(BookingStatus.EXPIRED);
            bookingRepository.save(booking);
            throw new IllegalStateException("Thời gian giữ ghế đã hết hạn.");
        }

        // Confirm seats in event-service
        List<Long> seatIds = booking.getItems().stream().map(BookingItemEntity::getSeatId).toList();
        eventServiceClient.confirmSeats(booking.getEventId(),
                new EventServiceClient.ConfirmSeatsRequest(seatIds));

        booking.setStatus(BookingStatus.CONFIRMED);
        BookingEntity updated = bookingRepository.save(booking);

        saveOutboxEvent("BOOKING", bookingCode, "BOOKING_CONFIRMED", Map.of(
                "bookingCode", bookingCode, "userId", booking.getUserId(),
                "totalAmount", booking.getTotalAmount()
        ));

        log.info("Booking confirmed: {}", bookingCode);
        return findByBookingCode(bookingCode).orElse(toResponse(updated, List.of(), ""));
    }

    @Transactional(readOnly = true)
    public Optional<BookingDtos.BookingResponse> findByBookingCode(String bookingCode) {
        return bookingRepository.findByBookingCode(bookingCode)
                .map(b -> {
                    List<EventServiceClient.SeatResponse> bookedSeats = List.of();
                    String eventTitle = "";
                    try {
                        ApiResponse<EventServiceClient.EventDetailResponse> eventRes = eventServiceClient.getEventDetail(b.getEventId());
                        if (eventRes != null && eventRes.getData() != null) {
                            eventTitle = eventRes.getData().title();
                            List<Long> bookedSeatIds = b.getItems().stream().map(BookingItemEntity::getSeatId).toList();
                            bookedSeats = eventRes.getData().seats().stream()
                                    .filter(s -> bookedSeatIds.contains(s.id()))
                                    .toList();
                        }
                    } catch (Exception e) {
                        log.error("Failed to fetch event/seat details from event-service for bookingCode={}", b.getBookingCode(), e);
                    }
                    return toResponse(b, bookedSeats, eventTitle);
                });
    }

    @Transactional(readOnly = true)
    public List<BookingDtos.BookingResponse> findMyBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(b -> toResponse(b, List.of(), "")).toList();
    }

    @Transactional(readOnly = true)
    public BookingDtos.AdminBookingListResponse findAllForAdmin(int page, int size) {
        Page<BookingEntity> result = bookingRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
        List<BookingDtos.AdminBookingResponse> content = result.getContent().stream()
                .map(b -> new BookingDtos.AdminBookingResponse(
                        b.getId(), b.getBookingCode(), b.getUserId(), b.getEventId(),
                        b.getStatus(), b.getTotalAmount(), b.getCreatedAt()))
                .toList();
        PageResponse<BookingDtos.AdminBookingResponse> pageResponse =
                PageResponse.of(content, page, size, result.getTotalElements());
        BigDecimal totalRevenue = bookingRepository.sumTotalAmountByStatus(BookingStatus.CONFIRMED);
        return new BookingDtos.AdminBookingListResponse(pageResponse, totalRevenue);
    }

    /** Auto-expire pending bookings every 10 seconds */
    @Scheduled(fixedRate = 10000)
    @Transactional
    public void expireStaleBookings() {
        List<BookingEntity> expired = bookingRepository.findExpiredBookings(BookingStatus.PENDING, ZonedDateTime.now());
        if (!expired.isEmpty()) {
            expired.forEach(b -> b.setStatus(BookingStatus.EXPIRED));
            bookingRepository.saveAll(expired);
            log.info("Marked {} bookings as EXPIRED", expired.size());
        }
    }

    private void saveOutboxEvent(String aggregateType, String aggregateId, String type, Object payload) {
        try {
            String payloadStr = objectMapper.writeValueAsString(payload);
            outboxEventRepository.save(OutboxEventEntity.builder()
                    .aggregateType(aggregateType).aggregateId(aggregateId)
                    .type(type).payload(payloadStr).status("PENDING")
                    .build());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize outbox event payload", e);
        }
    }

    private BookingDtos.BookingResponse toResponse(BookingEntity b, List<EventServiceClient.SeatResponse> seatDetails, String eventTitle) {
        List<BookingDtos.SeatInfo> seats = seatDetails.stream()
                .map(s -> new BookingDtos.SeatInfo(s.id(), s.seatNumber(), s.seatRow(), s.seatType(), s.price(), s.status()))
                .toList();
        return new BookingDtos.BookingResponse(
                b.getId(), b.getBookingCode(), b.getUserId(), b.getEventId(),
                eventTitle,
                b.getStatus(), b.getTotalAmount(), b.getExpiresAt(), seats, b.getCreatedAt()
        );
    }
}
