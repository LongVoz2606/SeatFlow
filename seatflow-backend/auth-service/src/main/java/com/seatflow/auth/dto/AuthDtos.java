package com.seatflow.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank(message = "Username không được để trống")
            @Size(min = 3, max = 50, message = "Username từ 3-50 ký tự")
            String username,

            @NotBlank(message = "Email không được để trống")
            @Email(message = "Email không hợp lệ")
            String email,

            @NotBlank(message = "Password không được để trống")
            @Size(min = 6, message = "Password tối thiểu 6 ký tự")
            String password,

            String fullName
    ) {}

    public record LoginRequest(
            @NotBlank(message = "Username/email không được để trống")
            String usernameOrEmail,

            @NotBlank(message = "Password không được để trống")
            String password
    ) {}

    public record TokenResponse(
            String accessToken,
            String tokenType,
            long expiresIn,
            Long userId,
            String username,
            String role
    ) {
        public static TokenResponse of(String token, long expiresInSeconds, Long userId, String username, String role) {
            return new TokenResponse(token, "Bearer", expiresInSeconds, userId, username, role);
        }
    }

    public record RefreshRequest(
            @NotBlank
            String refreshToken
    ) {}

    public record GoogleLoginRequest(
            @NotBlank(message = "idToken không được để trống")
            String idToken
    ) {}

    public record FacebookLoginRequest(
            @NotBlank(message = "accessToken không được để trống")
            String accessToken
    ) {}

    public record UserInfoResponse(
            Long id,
            String username,
            String email,
            String fullName,
            String role
    ) {}

    public record AdminUserResponse(
            Long id,
            String username,
            String email,
            String fullName,
            String role,
            boolean enabled,
            java.time.ZonedDateTime createdAt
    ) {}

    public record UpdateUserStatusRequest(
            Boolean enabled
    ) {}

    public record ForgotPasswordOtpRequest(
            @NotBlank(message = "Vui lòng nhập username hoặc email")
            String usernameOrEmail,

            @NotBlank(message = "Vui lòng chọn phương thức xác thực")
            String channel
    ) {}

    public record ForgotPasswordVerifyRequest(
            @NotBlank(message = "Vui lòng nhập username hoặc email")
            String usernameOrEmail,

            @NotBlank(message = "Vui lòng nhập mã OTP")
            @Size(min = 6, max = 6, message = "Mã OTP gồm 6 chữ số")
            String otp
    ) {}

    public record ResetPasswordRequest(
            @NotBlank(message = "Thiếu resetToken")
            String resetToken,

            @NotBlank(message = "Password không được để trống")
            @Size(min = 6, message = "Password tối thiểu 6 ký tự")
            String newPassword
    ) {}

    public record ChangePasswordOtpRequest(
            @NotBlank(message = "Vui lòng nhập mật khẩu hiện tại")
            String oldPassword,

            @NotBlank(message = "Vui lòng nhập mật khẩu mới")
            @Size(min = 6, message = "Password tối thiểu 6 ký tự")
            String newPassword
    ) {}

    public record ChangePasswordVerifyRequest(
            @NotBlank(message = "Vui lòng nhập mã OTP")
            @Size(min = 6, max = 6, message = "Mã OTP gồm 6 chữ số")
            String otp
    ) {}

    public record OtpSentResponse(
            String maskedDestination
    ) {}

    public record ResetTokenResponse(
            String resetToken
    ) {}
}
