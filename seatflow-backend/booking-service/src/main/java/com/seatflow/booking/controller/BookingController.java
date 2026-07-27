package com.seatflow.booking.controller;

import com.seatflow.booking.dto.BookingDtos;
import com.seatflow.booking.service.BookingService;
import com.seatflow.common.exception.ResourceNotFoundException;
import com.seatflow.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Bookings", description = "Quản lý đặt vé: giữ ghế, xác nhận, tra cứu")
public class BookingController {

    BookingService bookingService;

    @PostMapping("/hold")
    @Operation(summary = "Giữ chỗ (PENDING)")
    public ResponseEntity<ApiResponse<BookingDtos.BookingResponse>> holdSeats(
            @Valid @RequestBody BookingDtos.HoldSeatsRequest request,
            HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        BookingDtos.BookingResponse response = bookingService.holdSeats(request, userId);
        return ResponseEntity.ok(ApiResponse.ok(response, "Giữ ghế thành công! Vui lòng xác nhận trong " + 5 + " phút."));
    }

    @PostMapping("/confirm")
    @Operation(summary = "Xác nhận booking")
    public ResponseEntity<ApiResponse<BookingDtos.BookingResponse>> confirmBooking(
            @Valid @RequestBody BookingDtos.ConfirmBookingRequest request,
            HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        BookingDtos.BookingResponse response = bookingService.confirmBooking(
                request.bookingCode(), userId,
                request.paymentMethod() != null ? request.paymentMethod() : "MOMO"
        );
        return ResponseEntity.ok(ApiResponse.ok(response, "Booking đã được xác nhận!"));
    }

    @GetMapping("/{bookingCode}")
    @Operation(summary = "Tra cứu booking theo mã")
    public ResponseEntity<ApiResponse<BookingDtos.BookingResponse>> getBooking(
            @PathVariable String bookingCode) {
        BookingDtos.BookingResponse response = bookingService.findByBookingCode(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt vé: " + bookingCode));
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/my")
    @Operation(summary = "Danh sách booking của tôi")
    public ResponseEntity<ApiResponse<List<BookingDtos.BookingResponse>>> getMyBookings(
            HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("UNAUTHORIZED", "Bạn chưa đăng nhập."));
        }
        return ResponseEntity.ok(ApiResponse.ok(bookingService.findMyBookings(userId)));
    }
}
