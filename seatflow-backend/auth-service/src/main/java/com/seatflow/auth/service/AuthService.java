package com.seatflow.auth.service;

import com.seatflow.auth.dto.AuthDtos;
import com.seatflow.auth.entity.AuthRole;
import com.seatflow.auth.entity.AuthUserEntity;
import com.seatflow.auth.repository.AuthUserRepository;
import com.seatflow.common.exception.BusinessException;
import com.seatflow.common.exception.ResourceNotFoundException;
import com.seatflow.common.exception.UnauthorizedException;
import com.seatflow.common.security.JwtTokenProvider;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class AuthService {

    final AuthUserRepository authUserRepository;
    final PasswordEncoder passwordEncoder;
    final JwtTokenProvider jwtTokenProvider;

    @Value("${seatflow.jwt.access-token-expiry-seconds:86400}")
    long accessTokenExpirySeconds;

    @Transactional
    public AuthDtos.TokenResponse register(AuthDtos.RegisterRequest request) {
        if (authUserRepository.existsByUsername(request.username())) {
            throw new BusinessException("USERNAME_TAKEN", "Username '" + request.username() + "' đã được sử dụng.");
        }
        if (authUserRepository.existsByEmail(request.email())) {
            throw new BusinessException("EMAIL_TAKEN", "Email '" + request.email() + "' đã được đăng ký.");
        }

        AuthUserEntity user = AuthUserEntity.builder()
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .role(AuthRole.USER)
                .build();

        AuthUserEntity saved = authUserRepository.save(user);
        log.info("New user registered: {}", saved.getUsername());

        String token = jwtTokenProvider.generateAccessToken(
                saved.getId(), saved.getUsername(), saved.getRole().name()
        );
        return AuthDtos.TokenResponse.of(token, accessTokenExpirySeconds, saved.getId(), saved.getUsername(), saved.getRole().name());
    }

    @Transactional(readOnly = true)
    public AuthDtos.TokenResponse login(AuthDtos.LoginRequest request) {
        AuthUserEntity user = authUserRepository.findByUsername(request.usernameOrEmail())
                .or(() -> authUserRepository.findByEmail(request.usernameOrEmail()))
                .orElseThrow(() -> new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không đúng."));

        if (!user.isEnabled()) {
            throw new UnauthorizedException("Tài khoản của bạn đã bị vô hiệu hóa.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không đúng.");
        }

        String token = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getUsername(), user.getRole().name()
        );
        log.info("User logged in: {}", user.getUsername());
        return AuthDtos.TokenResponse.of(token, accessTokenExpirySeconds, user.getId(), user.getUsername(), user.getRole().name());
    }

    @Transactional(readOnly = true)
    public AuthDtos.UserInfoResponse getMyInfo(Long userId) {
        AuthUserEntity user = authUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng."));
        return new AuthDtos.UserInfoResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name()
        );
    }
}
