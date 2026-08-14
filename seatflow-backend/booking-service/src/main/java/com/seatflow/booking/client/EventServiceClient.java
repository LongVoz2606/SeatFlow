package com.seatflow.booking.client;

import com.seatflow.common.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.math.BigDecimal;
import java.util.List;

/**
 * Feign client for calling event-service internal APIs.
 */
@FeignClient(name = "event-service", url = "${seatflow.event-service.url:http://localhost:8083}")
public interface EventServiceClient {

    record HoldSeatsRequest(Long userId, List<Long> seatIds, int holdDurationMinutes) {}
    record SeatResponse(Long id, Long eventId, String seatNumber, String seatRow, String seatType, BigDecimal price, String status) {}
    record HoldSeatsResponse(boolean success, List<SeatResponse> heldSeats, String message) {}
    record ConfirmSeatsRequest(List<Long> seatIds) {}

    record EventDetailResponse(
            Long id,
            String title,
            String description,
            String location,
            String eventDate,
            String bannerUrl,
            int totalSeats,
            int availableSeats,
            String status,
            Long organizerId,
            List<SeatResponse> seats
    ) {}

    record OrganizerLookupResponse(Long id, Long authUserId, String organizationName, String status) {}

    @org.springframework.web.bind.annotation.GetMapping("/api/events/{id}")
    ApiResponse<EventDetailResponse> getEventDetail(@PathVariable("id") Long id);

    @org.springframework.web.bind.annotation.GetMapping("/api/organizers/internal/by-auth-user/{authUserId}")
    ApiResponse<OrganizerLookupResponse> getOrganizerByAuthUserId(@PathVariable("authUserId") Long authUserId);

    @PostMapping("/api/events/{eventId}/seats/hold")
    ApiResponse<HoldSeatsResponse> holdSeats(
            @PathVariable("eventId") Long eventId,
            @RequestBody HoldSeatsRequest request
    );

    @PostMapping("/api/events/{eventId}/seats/confirm")
    ApiResponse<Void> confirmSeats(
            @PathVariable("eventId") Long eventId,
            @RequestBody ConfirmSeatsRequest request
    );
}
