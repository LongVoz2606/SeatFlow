package com.seatflow.controller;

import com.seatflow.dto.request.ConfirmBookingRequest;
import com.seatflow.dto.request.HoldSeatRequest;
import com.seatflow.dto.response.ApiResponse;
import com.seatflow.dto.response.BookingDto;
import com.seatflow.service.SeatBookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Ticket Booking & High-Concurrency Hold Endpoints")
public class BookingController {

    private final SeatBookingService seatBookingService;

    @PostMapping("/hold")
    @Operation(summary = "Hold selected seats with 5-minute TTL lock (Requires Idempotency-Key header)")
    public ResponseEntity<ApiResponse<BookingDto>> holdSeats(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody HoldSeatRequest request) {

        BookingDto dto = seatBookingService.holdSeats(request, idempotencyKey);
        return ResponseEntity.ok(ApiResponse.success(dto, "Giữ ghế thành công! Bạn có 5 phút để hoàn tất thanh toán."));
    }

    @PostMapping("/confirm")
    @Operation(summary = "Confirm booking & complete payment")
    public ResponseEntity<ApiResponse<BookingDto>> confirmBooking(
            @Valid @RequestBody ConfirmBookingRequest request) {

        BookingDto dto = seatBookingService.confirmBooking(request);
        return ResponseEntity.ok(ApiResponse.success(dto, "Xác nhận đặt vé & thanh toán thành công!"));
    }

    @GetMapping("/{bookingCode}")
    @Operation(summary = "Get booking details by code")
    public ResponseEntity<ApiResponse<BookingDto>> getBooking(@PathVariable("bookingCode") String bookingCode) {
        BookingDto dto = seatBookingService.getBookingByCode(bookingCode);
        return ResponseEntity.ok(ApiResponse.success(dto, "Lấy thông tin đơn đặt vé thành công."));
    }
}
