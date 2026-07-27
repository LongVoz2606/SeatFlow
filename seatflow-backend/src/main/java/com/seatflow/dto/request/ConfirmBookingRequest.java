package com.seatflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ConfirmBookingRequest {

    @NotBlank(message = "Booking code is required")
    private String bookingCode;

    @NotNull(message = "User ID is required")
    private Long userId;

    private String paymentMethod; // MOCK_CARD, VNPAY, MOMO
}
