package com.seatflow.dto.response;

import com.seatflow.entity.SeatStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatDto {
    private Long id;
    private Long eventId;
    private String seatNumber;
    private String seatRow;
    private String seatType;
    private BigDecimal price;
    private SeatStatus status;
    private ZonedDateTime heldUntil;
    private Long heldByUserId;
}
