package com.seatflow.event.controller;

import com.seatflow.common.exception.ResourceNotFoundException;
import com.seatflow.common.response.ApiResponse;
import com.seatflow.event.dto.EventDtos;
import com.seatflow.event.service.EventCommandService;
import com.seatflow.event.service.EventQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Events", description = "Quản lý sự kiện và sơ đồ ghế ngồi")
public class EventController {

    EventQueryService eventQueryService;
    EventCommandService eventCommandService;

    @GetMapping
    @Operation(summary = "Lấy danh sách sự kiện đang diễn ra")
    public ResponseEntity<ApiResponse<List<EventDtos.EventResponse>>> getAllEvents() {
        return ResponseEntity.ok(ApiResponse.ok(eventQueryService.findAllActiveEvents()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết sự kiện và sơ đồ ghế")
    public ResponseEntity<ApiResponse<EventDtos.EventDetailResponse>> getEventDetail(
            @PathVariable Long id) {
        EventDtos.EventDetailResponse detail = eventQueryService.findByIdWithSeatMap(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sự kiện ID: " + id));
        return ResponseEntity.ok(ApiResponse.ok(detail));
    }

    // ===== Internal APIs (called by booking-service) =====

    @PostMapping("/{eventId}/seats/hold")
    @Operation(summary = "[Internal] Giữ ghế cho booking-service")
    public ResponseEntity<ApiResponse<EventDtos.HoldSeatsResponse>> holdSeats(
            @PathVariable Long eventId,
            @RequestBody EventDtos.HoldSeatsRequest request) {
        EventDtos.HoldSeatsResponse response = eventCommandService.holdSeats(eventId, request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/{eventId}/seats/confirm")
    @Operation(summary = "[Internal] Xác nhận ghế sau thanh toán")
    public ResponseEntity<ApiResponse<Void>> confirmSeats(
            @PathVariable Long eventId,
            @RequestBody EventDtos.ConfirmSeatsRequest request) {
        eventCommandService.confirmSeats(eventId, request);
        return ResponseEntity.ok(ApiResponse.ok(null, "Ghế đã được xác nhận."));
    }
}
