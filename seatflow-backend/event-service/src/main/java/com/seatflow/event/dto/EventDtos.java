package com.seatflow.event.dto;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

public class EventDtos {

    public record EventResponse(
            Long id,
            String title,
            String description,
            String location,
            ZonedDateTime eventDate,
            String bannerUrl,
            Integer totalSeats,
            Integer availableSeats,
            String status,
            Long organizerId,
            String organizerName,
            Boolean isHot,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String category,
            ZonedDateTime createdAt,
            String rejectionReason
    ) {}

    public record SeatResponse(
            Long id,
            Long eventId,
            String seatNumber,
            String seatRow,
            String seatType,
            BigDecimal price,
            String status
    ) {}

    public record EventDetailResponse(
            Long id,
            String title,
            String description,
            String location,
            ZonedDateTime eventDate,
            String bannerUrl,
            Integer totalSeats,
            Integer availableSeats,
            String status,
            Long organizerId,
            String organizerName,
            Boolean isHot,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String category,
            List<SeatResponse> seats
    ) {}

    public record SeatSectionRequest(
            String rowLabel,
            Integer seatCount,
            String seatType,
            BigDecimal price
    ) {}

    public record CreateEventRequest(
            String title,
            String description,
            String location,
            ZonedDateTime eventDate,
            String bannerUrl,
            String category,
            List<SeatSectionRequest> seatSections
    ) {}

    public record SetHotRequest(
            Boolean isHot
    ) {}

    public record RejectEventRequest(
            String reason
    ) {}

    // Internal API DTOs (used by booking-service via Feign)
    public record HoldSeatsRequest(
            Long userId,
            List<Long> seatIds,
            int holdDurationMinutes
    ) {}

    public record HoldSeatsResponse(
            boolean success,
            List<SeatResponse> heldSeats,
            String message
    ) {}

    public record ConfirmSeatsRequest(
            List<Long> seatIds
    ) {}
}
