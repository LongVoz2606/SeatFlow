package com.seatflow.auth.otp;

import com.seatflow.common.exception.BusinessException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.UUID;

/**
 * Sinh, lưu trữ và xác thực mã OTP 6 chữ số bằng Redis (key tự hết hạn qua TTL).
 * Dùng chung cho luồng quên mật khẩu và đổi mật khẩu.
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OtpService {

    static final Duration OTP_TTL = Duration.ofMinutes(5);
    static final Duration COOLDOWN_TTL = Duration.ofSeconds(60);
    static final Duration RESET_TICKET_TTL = Duration.ofMinutes(10);
    static final int MAX_ATTEMPTS = 5;

    StringRedisTemplate redisTemplate;
    SecureRandom random = new SecureRandom();

    public String generateAndStore(String key) {
        String cooldownKey = "otp:cooldown:" + key;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(cooldownKey))) {
            throw new BusinessException("OTP_COOLDOWN", "Vui lòng đợi ít nhất 60 giây trước khi yêu cầu gửi lại mã OTP.");
        }

        String code = String.format("%06d", random.nextInt(1_000_000));
        redisTemplate.opsForValue().set("otp:code:" + key, code, OTP_TTL);
        redisTemplate.delete("otp:attempts:" + key);
        redisTemplate.opsForValue().set(cooldownKey, "1", COOLDOWN_TTL);
        return code;
    }

    public void verify(String key, String submittedCode) {
        String codeKey = "otp:code:" + key;
        String attemptsKey = "otp:attempts:" + key;

        String storedCode = redisTemplate.opsForValue().get(codeKey);
        if (storedCode == null) {
            throw new BusinessException("OTP_EXPIRED", "Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng yêu cầu gửi lại mã.");
        }

        Long attempts = redisTemplate.opsForValue().increment(attemptsKey);
        if (attempts != null && attempts == 1L) {
            redisTemplate.expire(attemptsKey, OTP_TTL);
        }
        if (attempts != null && attempts > MAX_ATTEMPTS) {
            redisTemplate.delete(codeKey);
            redisTemplate.delete(attemptsKey);
            throw new BusinessException("OTP_TOO_MANY_ATTEMPTS", "Bạn đã nhập sai mã OTP quá nhiều lần. Vui lòng yêu cầu gửi lại mã.");
        }

        if (!storedCode.equals(submittedCode)) {
            throw new BusinessException("OTP_INVALID", "Mã OTP không chính xác.");
        }

        redisTemplate.delete(codeKey);
        redisTemplate.delete(attemptsKey);
    }

    public String issueTicket(Long userId) {
        String ticket = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set("otp:ticket:" + ticket, String.valueOf(userId), RESET_TICKET_TTL);
        return ticket;
    }

    public Long consumeTicket(String ticket) {
        String key = "otp:ticket:" + ticket;
        String userId = redisTemplate.opsForValue().get(key);
        if (userId == null) {
            throw new BusinessException("RESET_TOKEN_INVALID", "Yêu cầu đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
        }
        redisTemplate.delete(key);
        return Long.valueOf(userId);
    }

    public void storePending(String key, String value, Duration ttl) {
        redisTemplate.opsForValue().set("otp:pending:" + key, value, ttl);
    }

    public String getPending(String key) {
        return redisTemplate.opsForValue().get("otp:pending:" + key);
    }

    public void clearPending(String key) {
        redisTemplate.delete("otp:pending:" + key);
    }
}
