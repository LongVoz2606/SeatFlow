package com.seatflow.payment.controller;

import com.seatflow.common.response.ApiResponse;
import com.seatflow.payment.entity.PaymentEntity;
import com.seatflow.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Giả lập và quản lý giao dịch thanh toán")
public class PaymentController {

    private final PaymentService paymentService;

    public record ProcessPaymentRequest(String bookingCode) {}

    @PostMapping("/process")
    @Operation(summary = "Giả lập thanh toán thành công và đồng bộ tới booking-service")
    public ResponseEntity<ApiResponse<PaymentEntity>> processPayment(
            @RequestBody ProcessPaymentRequest request) {
        PaymentEntity payment = paymentService.processMockPayment(request.bookingCode());
        return ResponseEntity.ok(ApiResponse.ok(payment, "Thanh toán thành công!"));
    }

    @GetMapping("/{bookingCode}")
    @Operation(summary = "Lấy thông tin giao dịch theo mã đặt vé")
    public ResponseEntity<ApiResponse<PaymentEntity>> getPayment(
            @PathVariable String bookingCode) {
        PaymentEntity payment = paymentService.getPaymentByBookingCode(bookingCode);
        return ResponseEntity.ok(ApiResponse.ok(payment));
    }
}
