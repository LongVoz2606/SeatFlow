package com.seatflow.dto.response;

import com.seatflow.entity.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDto {
    private Long id;
    private String bookingCode;
    private Long userId;
    private Long eventId;
    private String eventTitle;
    private BookingStatus status;
    private BigDecimal totalAmount;
    private ZonedDateTime expiresAt;
    private ZonedDateTime createdAt;
    private List<SeatDto> reservedSeats;
}
