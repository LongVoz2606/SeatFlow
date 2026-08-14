package com.seatflow.auth.service;

import com.seatflow.auth.client.UserServiceClient;
import com.seatflow.auth.dto.AuthDtos;
import com.seatflow.auth.entity.AuthProvider;
import com.seatflow.auth.entity.AuthRole;
import com.seatflow.auth.entity.AuthUserEntity;
import com.seatflow.auth.notification.EmailSender;
import com.seatflow.auth.notification.SmsSender;
import com.seatflow.auth.otp.OtpService;
import com.seatflow.auth.repository.AuthUserRepository;
import com.seatflow.common.exception.BusinessException;
import com.seatflow.common.exception.ResourceNotFoundException;
import com.seatflow.common.exception.UnauthorizedException;
import com.seatflow.common.response.PageResponse;
import com.seatflow.common.security.JwtTokenProvider;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class AuthService {

    final AuthUserRepository authUserRepository;
    final PasswordEncoder passwordEncoder;
    final JwtTokenProvider jwtTokenProvider;
    final OtpService otpService;
    final EmailSender emailSender;
    final SmsSender smsSender;
    final UserServiceClient userServiceClient;

    @Value("${seatflow.jwt.access-token-expiry-seconds:86400}")
    long accessTokenExpirySeconds;

    @Value("${seatflow.oauth.google.client-id:}")
    String googleClientId;

    final RestClient restClient = RestClient.create();

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
                saved.getId(), saved.getUsername(), saved.getRole().name(), saved.getEmail(), saved.getFullName()
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
                user.getId(), user.getUsername(), user.getRole().name(), user.getEmail(), user.getFullName()
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
                user.getRole().name(),
                user.getProvider().name()
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<AuthDtos.AdminUserResponse> findAllUsers(String search, int page, int size) {
        Page<AuthUserEntity> result = StringUtils.hasText(search)
                ? authUserRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        search, search, PageRequest.of(page, size))
                : authUserRepository.findAll(PageRequest.of(page, size));

        List<AuthDtos.AdminUserResponse> content = result.getContent().stream()
                .map(u -> new AuthDtos.AdminUserResponse(
                        u.getId(), u.getUsername(), u.getEmail(), u.getFullName(),
                        u.getRole().name(), u.isEnabled(), u.getCreatedAt(), u.getProvider().name()))
                .toList();
        return PageResponse.of(content, page, size, result.getTotalElements());
    }

    @Transactional
    public void setUserEnabled(Long userId, boolean enabled) {
        AuthUserEntity user = authUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng."));
        user.setEnabled(enabled);
        authUserRepository.save(user);
        log.info("User {} enabled={}", userId, enabled);
    }

    /**
     * Verify Google ID token bằng endpoint tokeninfo công khai của Google, không cần client secret.
     */
    @Transactional
    public AuthDtos.TokenResponse loginWithGoogle(String idToken) {
        GoogleTokenInfo info;
        try {
            info = restClient.get()
                    .uri("https://oauth2.googleapis.com/tokeninfo?id_token={idToken}", idToken)
                    .retrieve()
                    .body(GoogleTokenInfo.class);
        } catch (RestClientException e) {
            throw new UnauthorizedException("Google ID token không hợp lệ hoặc đã hết hạn.");
        }

        if (info == null || !StringUtils.hasText(info.email())) {
            throw new UnauthorizedException("Không lấy được thông tin tài khoản Google.");
        }
        if (StringUtils.hasText(googleClientId) && !googleClientId.equals(info.aud())) {
            throw new UnauthorizedException("Google ID token không thuộc về ứng dụng này.");
        }

        return loginOrRegisterOAuth(info.email(), info.name(), AuthProvider.GOOGLE);
    }

    /**
     * Verify Facebook access token bằng Graph API /me.
     */
    @Transactional
    public AuthDtos.TokenResponse loginWithFacebook(String accessToken) {
        FacebookProfile profile;
        try {
            profile = restClient.get()
                    .uri("https://graph.facebook.com/me?fields=id,name,email&access_token={accessToken}", accessToken)
                    .retrieve()
                    .body(FacebookProfile.class);
        } catch (RestClientException e) {
            throw new UnauthorizedException("Facebook access token không hợp lệ hoặc đã hết hạn.");
        }

        if (profile == null || !StringUtils.hasText(profile.email())) {
            throw new BusinessException("FACEBOOK_EMAIL_REQUIRED", "Tài khoản Facebook của bạn chưa xác thực email. Vui lòng cấp quyền email để đăng nhập.");
        }

        return loginOrRegisterOAuth(profile.email(), profile.name(), AuthProvider.FACEBOOK);
    }

    private AuthDtos.TokenResponse loginOrRegisterOAuth(String email, String displayName, AuthProvider provider) {
        AuthUserEntity user = authUserRepository.findByEmail(email).orElseGet(() -> {
            String baseUsername = email.substring(0, email.indexOf('@'));
            String username = baseUsername;
            while (authUserRepository.existsByUsername(username)) {
                username = baseUsername + (int) (Math.random() * 9000 + 1000);
            }
            AuthUserEntity created = AuthUserEntity.builder()
                    .username(username)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .fullName(displayName)
                    .role(AuthRole.USER)
                    .provider(provider)
                    .build();
            AuthUserEntity saved = authUserRepository.save(created);
            log.info("New user auto-provisioned via OAuth: {}", saved.getUsername());
            return saved;
        });

        if (!user.isEnabled()) {
            throw new UnauthorizedException("Tài khoản của bạn đã bị vô hiệu hóa.");
        }

        String token = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getUsername(), user.getRole().name(), user.getEmail(), user.getFullName()
        );
        log.info("User logged in via OAuth: {}", user.getUsername());
        return AuthDtos.TokenResponse.of(token, accessTokenExpirySeconds, user.getId(), user.getUsername(), user.getRole().name());
    }

    // ─── Quên mật khẩu (chưa đăng nhập) ────────────────────────────────────

    @Transactional(readOnly = true)
    public String forgotPasswordRequestOtp(String usernameOrEmail, String channel) {
        AuthUserEntity user = findByUsernameOrEmail(usernameOrEmail);
        String otpKey = "reset:" + user.getId();
        String code = otpService.generateAndStore(otpKey);

        if ("SMS".equalsIgnoreCase(channel)) {
            String phone = userServiceClient.getPhone(user.getId())
                    .filter(StringUtils::hasText)
                    .orElseThrow(() -> new BusinessException("PHONE_NOT_SET",
                            "Bạn chưa cập nhật số điện thoại trong hồ sơ. Vui lòng chọn xác thực qua Email hoặc cập nhật SĐT trước."));
            smsSender.send(normalizePhone(phone),
                    "SeatFlow: Ma OTP dat lai mat khau cua ban la " + code + ". Ma co hieu luc trong 5 phut. Khong chia se ma nay cho bat ky ai.");
            log.info("Forgot-password OTP sent via SMS for user {}", user.getUsername());
            return maskPhone(phone);
        }

        emailSender.send(user.getEmail(), "SeatFlow - Mã OTP đặt lại mật khẩu",
                "Mã OTP đặt lại mật khẩu của bạn là: " + code + "\nMã có hiệu lực trong 5 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.");
        log.info("Forgot-password OTP sent via Email for user {}", user.getUsername());
        return maskEmail(user.getEmail());
    }

    @Transactional(readOnly = true)
    public String forgotPasswordVerifyOtp(String usernameOrEmail, String otp) {
        AuthUserEntity user = findByUsernameOrEmail(usernameOrEmail);
        otpService.verify("reset:" + user.getId(), otp);
        return otpService.issueTicket(user.getId());
    }

    @Transactional
    public void resetPassword(String resetToken, String newPassword) {
        Long userId = otpService.consumeTicket(resetToken);
        AuthUserEntity user = authUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng."));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        authUserRepository.save(user);
        log.info("Password reset via OTP for user {}", user.getUsername());
    }

    // ─── Đổi mật khẩu (đã đăng nhập) ───────────────────────────────────────

    @Transactional(readOnly = true)
    public String changePasswordRequestOtp(Long userId, String oldPassword, String newPassword) {
        AuthUserEntity user = authUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng."));

        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new BusinessException("OLD_PASSWORD_INCORRECT", "Mật khẩu hiện tại không đúng.");
        }
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new BusinessException("SAME_PASSWORD", "Mật khẩu mới phải khác mật khẩu hiện tại.");
        }

        String key = "change:" + userId;
        String code = otpService.generateAndStore(key);
        otpService.storePending(key, passwordEncoder.encode(newPassword), Duration.ofMinutes(5));

        emailSender.send(user.getEmail(), "SeatFlow - Mã OTP đổi mật khẩu",
                "Mã OTP xác nhận đổi mật khẩu của bạn là: " + code + "\nMã có hiệu lực trong 5 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.");
        log.info("Change-password OTP sent for user {}", user.getUsername());
        return maskEmail(user.getEmail());
    }

    @Transactional
    public void changePasswordVerifyOtp(Long userId, String otp) {
        String key = "change:" + userId;
        otpService.verify(key, otp);

        String pendingHash = otpService.getPending(key);
        if (pendingHash == null) {
            throw new BusinessException("OTP_EXPIRED", "Phiên đổi mật khẩu đã hết hạn. Vui lòng thực hiện lại từ đầu.");
        }
        otpService.clearPending(key);

        AuthUserEntity user = authUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng."));
        user.setPasswordHash(pendingHash);
        authUserRepository.save(user);
        log.info("Password changed via OTP for user {}", user.getUsername());
    }

    // ─── Helpers ────────────────────────────────────────────────────────────

    private AuthUserEntity findByUsernameOrEmail(String usernameOrEmail) {
        return authUserRepository.findByUsername(usernameOrEmail)
                .or(() -> authUserRepository.findByEmail(usernameOrEmail))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với username/email này."));
    }

    private String maskEmail(String email) {
        int at = email.indexOf('@');
        if (at <= 1) return email;
        return email.substring(0, Math.min(2, at)) + "***" + email.substring(at);
    }

    private String maskPhone(String phone) {
        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.length() <= 4) return phone;
        return "***" + digits.substring(digits.length() - 4);
    }

    private String normalizePhone(String phone) {
        String digits = phone.replaceAll("[^0-9+]", "");
        if (digits.startsWith("+")) return digits;
        if (digits.startsWith("0")) return "+84" + digits.substring(1);
        return "+" + digits;
    }

    private record GoogleTokenInfo(String aud, String email, String name) {}

    private record FacebookProfile(String id, String name, String email) {}
}
