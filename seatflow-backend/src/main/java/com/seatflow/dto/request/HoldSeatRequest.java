package com.seatflow.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class HoldSeatRequest {

    @NotNull(message = "Event ID is required")
    private Long eventId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotEmpty(message = "At least one seat must be selected")
    private List<Long> seatIds;
}
