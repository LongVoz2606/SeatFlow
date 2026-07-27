package com.seatflow.controller;

import com.seatflow.dto.response.ApiResponse;
import com.seatflow.dto.response.EventDto;
import com.seatflow.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Tag(name = "Events", description = "Event Management & Seat Map Endpoints")
public class EventController {

    private final EventService eventService;

    @GetMapping
    @Operation(summary = "Get list of active events")
    public ResponseEntity<ApiResponse<List<EventDto>>> getAllEvents() {
        return ResponseEntity.ok(ApiResponse.success(
                eventService.getAllActiveEvents(),
                "Lấy danh sách sự kiện thành công."
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get event detail with interactive seat map")
    public ResponseEntity<ApiResponse<EventDto>> getEventDetail(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                eventService.getEventDetailWithSeatMap(id),
                "Lấy thông tin chi tiết sự kiện thành công."
        ));
    }
}
