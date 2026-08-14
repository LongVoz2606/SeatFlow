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
            String rejectionReason,
            Integer sessionCount
    ) {}

    public record SeatResponse(
            Long id,
            Long eventId,
            Long zoneId,
            Integer rowIndex,
            Integer colIndex,
            String seatNumber,
            String seatRow,
            String seatType,
            BigDecimal price,
            String status
    ) {}

    public record ZoneRequest(
            String name,
            String seatType,
            BigDecimal price,
            Integer rowCount,
            Integer colCount,
            BigDecimal rowSpacing,
            BigDecimal colSpacing,
            BigDecimal curveAngle,
            BigDecimal positionX,
            BigDecimal positionY,
            BigDecimal rotation,
            String color
    ) {}

    public record ZoneResponse(
            Long id,
            String name,
            String seatType,
            BigDecimal price,
            Integer rowCount,
            Integer colCount,
            BigDecimal rowSpacing,
            BigDecimal colSpacing,
            BigDecimal curveAngle,
            BigDecimal positionX,
            BigDecimal positionY,
            BigDecimal rotation,
            String color
    ) {}

    public record SessionResponse(
            Long id,
            ZonedDateTime sessionDate,
            Integer totalSeats,
            Integer availableSeats,
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
            String organizerDescription,
            String organizerLogoUrl,
            Boolean isHot,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String category,
            Long parentEventId,
            List<ZoneResponse> zones,
            List<SessionResponse> sessions,
            List<SeatResponse> seats
    ) {}

    public record CreateEventRequest(
            String title,
            String description,
            String location,
            String bannerUrl,
            String category,
            List<ZonedDateTime> sessionDates,
            List<ZoneRequest> zones
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
