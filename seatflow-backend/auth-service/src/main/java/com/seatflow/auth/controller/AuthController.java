package com.seatflow.auth.controller;

import com.seatflow.auth.dto.AuthDtos;
import com.seatflow.auth.service.AuthService;
import com.seatflow.common.response.ApiResponse;
import com.seatflow.common.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Authentication", description = "Đăng ký, đăng nhập, lấy thông tin người dùng")
public class AuthController {

    AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản mới")
    public ResponseEntity<ApiResponse<AuthDtos.TokenResponse>> register(
            @Valid @RequestBody AuthDtos.RegisterRequest request) {
        AuthDtos.TokenResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Đăng ký thành công!"));
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập và nhận JWT token")
    public ResponseEntity<ApiResponse<AuthDtos.TokenResponse>> login(
            @Valid @RequestBody AuthDtos.LoginRequest request) {
        AuthDtos.TokenResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Đăng nhập thành công!"));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin người dùng hiện tại")
    public ResponseEntity<ApiResponse<AuthDtos.UserInfoResponse>> getMyInfo(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("UNAUTHORIZED", "Bạn chưa đăng nhập."));
        }
        return ResponseEntity.ok(ApiResponse.ok(authService.getMyInfo(userId)));
    }

    @GetMapping("/users")
    @Operation(summary = "[Admin] Danh sách người dùng (tìm kiếm & phân trang)")
    public ResponseEntity<ApiResponse<PageResponse<AuthDtos.AdminUserResponse>>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(authService.findAllUsers(search, page, size)));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "[Admin] Khoá/Mở tài khoản người dùng")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody AuthDtos.UpdateUserStatusRequest request) {
        authService.setUserEnabled(id, Boolean.TRUE.equals(request.enabled()));
        return ResponseEntity.ok(ApiResponse.ok(null, "Cập nhật trạng thái tài khoản thành công."));
    }
}
