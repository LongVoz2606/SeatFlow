package com.seatflow.user.controller;

import com.seatflow.common.response.ApiResponse;
import com.seatflow.user.entity.UserProfileEntity;
import com.seatflow.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Profiles", description = "Quản lý thông tin cá nhân người dùng")
public class UserController {

    private final UserService userService;

    public record UpdateProfileRequest(
            String fullName,
            String phone,
            String avatarUrl
    ) {}

    @GetMapping("/me")
    @Operation(summary = "Lấy hồ sơ cá nhân của tôi")
    public ResponseEntity<ApiResponse<UserProfileEntity>> getMyProfile(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String username = (String) request.getAttribute("username");

        if (userId == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("UNAUTHORIZED", "Bạn chưa đăng nhập."));
        }

        UserProfileEntity profile = userService.getProfileByUserId(userId, username, null);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PutMapping("/me")
    @Operation(summary = "Cập nhật hồ sơ cá nhân")
    public ResponseEntity<ApiResponse<UserProfileEntity>> updateProfile(
            HttpServletRequest request,
            @RequestBody UpdateProfileRequest updateRequest) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("UNAUTHORIZED", "Bạn chưa đăng nhập."));
        }

        UserProfileEntity updated = userService.updateProfile(
                userId,
                updateRequest.fullName(),
                updateRequest.phone(),
                updateRequest.avatarUrl()
        );
        return ResponseEntity.ok(ApiResponse.ok(updated, "Cập nhật hồ sơ thành công!"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy hồ sơ theo ID người dùng")
    public ResponseEntity<ApiResponse<UserProfileEntity>> getProfileById(@PathVariable Long id) {
        UserProfileEntity profile = userService.getProfileByUserId(id, null, null);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }
}
