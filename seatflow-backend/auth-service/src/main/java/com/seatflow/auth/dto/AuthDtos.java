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
}
