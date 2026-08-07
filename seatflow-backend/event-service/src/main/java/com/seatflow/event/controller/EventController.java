package com.seatflow.event.controller;

import com.seatflow.common.exception.ResourceNotFoundException;
import com.seatflow.common.response.ApiResponse;
import com.seatflow.event.dto.EventDtos;
import com.seatflow.event.service.EventCommandService;
import com.seatflow.event.service.EventQueryService;
import com.seatflow.event.specification.EventSearchCriteria;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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
    @Operation(summary = "Lấy danh sách sự kiện đang diễn ra (hỗ trợ tìm kiếm & lọc & phân trang)")
    public ResponseEntity<ApiResponse<com.seatflow.common.response.PageResponse<EventDtos.EventResponse>>> getAllEvents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean hot,
            @RequestParam(required = false) Long organizerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        EventSearchCriteria criteria = EventSearchCriteria.builder()
                .search(search)
                .location(location)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .hot(hot)
                .organizerId(organizerId)
                .build();
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.ok(eventQueryService.searchEventsPage(criteria, pageable)));
    }

    @GetMapping("/mine")
    @Operation(summary = "Danh sách sự kiện của nhà tổ chức hiện tại")
    public ResponseEntity<ApiResponse<List<EventDtos.EventResponse>>> getMyEvents(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("UNAUTHORIZED", "Bạn chưa đăng nhập."));
        }
        return ResponseEntity.ok(ApiResponse.ok(eventQueryService.findMyEvents(userId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết sự kiện và sơ đồ ghế")
    public ResponseEntity<ApiResponse<EventDtos.EventDetailResponse>> getEventDetail(
            @PathVariable Long id) {
        EventDtos.EventDetailResponse detail = eventQueryService.findByIdWithSeatMap(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sự kiện ID: " + id));
        return ResponseEntity.ok(ApiResponse.ok(detail));
    }

    @PostMapping
    @Operation(summary = "Nhà tổ chức (đã được duyệt) tạo sự kiện mới")
    public ResponseEntity<ApiResponse<Long>> createEvent(
            @RequestBody EventDtos.CreateEventRequest request,
            HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("UNAUTHORIZED", "Bạn chưa đăng nhập."));
        }
        Long eventId = eventCommandService.createEvent(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(eventId, "Tạo sự kiện thành công!"));
    }

    @PatchMapping("/{id}/hot")
    @Operation(summary = "[Admin] Gắn/gỡ cờ sự kiện nổi bật (HOT)")
    public ResponseEntity<ApiResponse<Void>> setHot(
            @PathVariable Long id,
            @RequestBody EventDtos.SetHotRequest request) {
        eventCommandService.setHot(id, Boolean.TRUE.equals(request.isHot()));
        return ResponseEntity.ok(ApiResponse.ok(null, "Cập nhật thành công."));
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
