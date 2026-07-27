package com.seatflow.booking.dto;

import com.seatflow.booking.entity.BookingStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

public class BookingDtos {

    public record HoldSeatsRequest(
            @NotNull(message = "eventId không được để trống")
            Long eventId,

            Long userId, // optional: lấy từ JWT nếu authenticated

            @NotEmpty(message = "Phải chọn ít nhất 1 ghế")
            List<Long> seatIds,

            String idempotencyKey
    ) {}

    public record ConfirmBookingRequest(
            @NotNull
            String bookingCode,

            Long userId,

            String paymentMethod
    ) {}

    public record SeatInfo(
            Long id,
            String seatNumber,
            String seatRow,
            String seatType,
            BigDecimal price,
            String status
    ) {}

    public record BookingResponse(
            Long id,
            String bookingCode,
            Long userId,
            Long eventId,
            String eventTitle,
            BookingStatus status,
            BigDecimal totalAmount,
            ZonedDateTime expiresAt,
            List<SeatInfo> seats,
            ZonedDateTime createdAt
    ) {}

    public record AdminBookingResponse(
            Long id,
            String bookingCode,
            Long userId,
            Long eventId,
            BookingStatus status,
            BigDecimal totalAmount,
            ZonedDateTime createdAt
    ) {}

    public record AdminBookingListResponse(
            com.seatflow.common.response.PageResponse<AdminBookingResponse> page,
            BigDecimal totalRevenue
    ) {}
}
