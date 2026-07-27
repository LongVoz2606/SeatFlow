package com.seatflow.event.controller;

import com.seatflow.common.response.ApiResponse;
import com.seatflow.event.dto.OrganizerDtos;
import com.seatflow.event.service.OrganizerCommandService;
import com.seatflow.event.service.OrganizerQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizers")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Organizers", description = "Đăng ký, duyệt và quản lý Nhà tổ chức sự kiện")
public class OrganizerController {

    OrganizerQueryService organizerQueryService;
    OrganizerCommandService organizerCommandService;

    @GetMapping
    @Operation(summary = "Danh sách nhà tổ chức đã được duyệt (public)")
    public ResponseEntity<ApiResponse<List<OrganizerDtos.OrganizerPublicResponse>>> getAllApproved() {
        return ResponseEntity.ok(ApiResponse.ok(organizerQueryService.findAllApproved()));
    }

    @PostMapping("/register")
    @Operation(summary = "Đăng ký trở thành nhà tổ chức")
    public ResponseEntity<ApiResponse<Long>> register(
            @RequestBody OrganizerDtos.RegisterOrganizerRequest request,
            HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("UNAUTHORIZED", "Bạn chưa đăng nhập."));
        }
        Long id = organizerCommandService.register(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(id, "Đăng ký nhà tổ chức thành công! Vui lòng chờ Admin duyệt."));
    }

    @PostMapping("/resubmit")
    @Operation(summary = "Gửi lại hồ sơ nhà tổ chức đã bị từ chối")
    public ResponseEntity<ApiResponse<Void>> resubmit(
            @RequestBody OrganizerDtos.RegisterOrganizerRequest request,
            HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("UNAUTHORIZED", "Bạn chưa đăng nhập."));
        }
        organizerCommandService.resubmit(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(null, "Đã gửi lại hồ sơ! Vui lòng chờ Admin duyệt."));
    }

    @GetMapping("/me")
    @Operation(summary = "Hồ sơ nhà tổ chức của tôi (nếu có)")
    public ResponseEntity<ApiResponse<OrganizerDtos.OrganizerResponse>> getMine(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("UNAUTHORIZED", "Bạn chưa đăng nhập."));
        }
        return ResponseEntity.ok(ApiResponse.ok(organizerQueryService.findMine(userId).orElse(null)));
    }

    @GetMapping("/pending")
    @Operation(summary = "[Admin] Danh sách hồ sơ nhà tổ chức đang chờ duyệt")
    public ResponseEntity<ApiResponse<List<OrganizerDtos.OrganizerResponse>>> getPending() {
        return ResponseEntity.ok(ApiResponse.ok(organizerQueryService.findPending()));
    }

    @PatchMapping("/{id}/approve")
    @Operation(summary = "[Admin] Duyệt hồ sơ nhà tổ chức")
    public ResponseEntity<ApiResponse<Void>> approve(@PathVariable Long id) {
        organizerCommandService.approve(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Đã duyệt nhà tổ chức."));
    }

    @PatchMapping("/{id}/reject")
    @Operation(summary = "[Admin] Từ chối hồ sơ nhà tổ chức")
    public ResponseEntity<ApiResponse<Void>> reject(
            @PathVariable Long id,
            @RequestBody OrganizerDtos.RejectOrganizerRequest request) {
        organizerCommandService.reject(id, request.reason());
        return ResponseEntity.ok(ApiResponse.ok(null, "Đã từ chối hồ sơ."));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Trang public của nhà tổ chức")
    public ResponseEntity<ApiResponse<OrganizerDtos.OrganizerPublicResponse>> getPublicById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(organizerQueryService.findPublicById(id)));
    }
}
