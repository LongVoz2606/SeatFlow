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

    @PostMapping("/oauth/google")
    @Operation(summary = "Đăng nhập bằng Google")
    public ResponseEntity<ApiResponse<AuthDtos.TokenResponse>> loginWithGoogle(
            @Valid @RequestBody AuthDtos.GoogleLoginRequest request) {
        AuthDtos.TokenResponse response = authService.loginWithGoogle(request.idToken());
        return ResponseEntity.ok(ApiResponse.ok(response, "Đăng nhập bằng Google thành công!"));
    }

    @PostMapping("/oauth/facebook")
    @Operation(summary = "Đăng nhập bằng Facebook")
    public ResponseEntity<ApiResponse<AuthDtos.TokenResponse>> loginWithFacebook(
            @Valid @RequestBody AuthDtos.FacebookLoginRequest request) {
        AuthDtos.TokenResponse response = authService.loginWithFacebook(request.accessToken());
        return ResponseEntity.ok(ApiResponse.ok(response, "Đăng nhập bằng Facebook thành công!"));
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

    @PostMapping("/forgot-password/request-otp")
    @Operation(summary = "Quên mật khẩu - gửi mã OTP qua Email hoặc SMS")
    public ResponseEntity<ApiResponse<AuthDtos.OtpSentResponse>> forgotPasswordRequestOtp(
            @Valid @RequestBody AuthDtos.ForgotPasswordOtpRequest request) {
        String masked = authService.forgotPasswordRequestOtp(request.usernameOrEmail(), request.channel());
        return ResponseEntity.ok(ApiResponse.ok(new AuthDtos.OtpSentResponse(masked), "Đã gửi mã OTP."));
    }

    @PostMapping("/forgot-password/verify-otp")
    @Operation(summary = "Quên mật khẩu - xác thực mã OTP, nhận resetToken")
    public ResponseEntity<ApiResponse<AuthDtos.ResetTokenResponse>> forgotPasswordVerifyOtp(
            @Valid @RequestBody AuthDtos.ForgotPasswordVerifyRequest request) {
        String resetToken = authService.forgotPasswordVerifyOtp(request.usernameOrEmail(), request.otp());
        return ResponseEntity.ok(ApiResponse.ok(new AuthDtos.ResetTokenResponse(resetToken), "Xác thực OTP thành công."));
    }

    @PostMapping("/forgot-password/reset-password")
    @Operation(summary = "Quên mật khẩu - đặt lại mật khẩu mới bằng resetToken")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody AuthDtos.ResetPasswordRequest request) {
        authService.resetPassword(request.resetToken(), request.newPassword());
        return ResponseEntity.ok(ApiResponse.ok(null, "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."));
    }

    @PostMapping("/change-password/request-otp")
    @Operation(summary = "Đổi mật khẩu - xác thực mật khẩu cũ và gửi mã OTP qua Email")
    public ResponseEntity<ApiResponse<AuthDtos.OtpSentResponse>> changePasswordRequestOtp(
            HttpServletRequest httpRequest,
            @Valid @RequestBody AuthDtos.ChangePasswordOtpRequest request) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("UNAUTHORIZED", "Bạn chưa đăng nhập."));
        }
        String masked = authService.changePasswordRequestOtp(userId, request.oldPassword(), request.newPassword());
        return ResponseEntity.ok(ApiResponse.ok(new AuthDtos.OtpSentResponse(masked), "Đã gửi mã OTP xác nhận đến email của bạn."));
    }

    @PostMapping("/change-password/verify-otp")
    @Operation(summary = "Đổi mật khẩu - xác thực OTP và cập nhật mật khẩu mới")
    public ResponseEntity<ApiResponse<Void>> changePasswordVerifyOtp(
            HttpServletRequest httpRequest,
            @Valid @RequestBody AuthDtos.ChangePasswordVerifyRequest request) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("UNAUTHORIZED", "Bạn chưa đăng nhập."));
        }
        authService.changePasswordVerifyOtp(userId, request.otp());
        return ResponseEntity.ok(ApiResponse.ok(null, "Đổi mật khẩu thành công."));
    }
}
