package com.seatflow.auth.notification;

import com.seatflow.common.exception.BusinessException;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Gửi SMS qua Twilio. Nếu chưa cấu hình TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM_NUMBER
 * (môi trường dev chưa có tài khoản Twilio thật), chỉ log mã OTP ra console để vẫn test được luồng.
 */
@Component
@Slf4j
public class SmsSender {

    @Value("${app.twilio.account-sid:}")
    private String accountSid;

    @Value("${app.twilio.auth-token:}")
    private String authToken;

    @Value("${app.twilio.from-number:}")
    private String fromNumber;

    private volatile boolean initialized = false;

    public void send(String toPhoneE164, String message) {
        if (!StringUtils.hasText(accountSid) || !StringUtils.hasText(authToken) || !StringUtils.hasText(fromNumber)) {
            log.warn("[DEV-SMS] (Twilio chưa được cấu hình) To: {} | Message: {}", toPhoneE164, message);
            return;
        }
        try {
            ensureInitialized();
            Message.creator(new PhoneNumber(toPhoneE164), new PhoneNumber(fromNumber), message).create();
        } catch (Exception e) {
            log.error("Gửi SMS tới {} thất bại: {}", toPhoneE164, e.getMessage());
            throw new BusinessException("SMS_SEND_FAILED", "Không thể gửi SMS OTP, vui lòng thử lại sau.");
        }
    }

    private void ensureInitialized() {
        if (!initialized) {
            synchronized (this) {
                if (!initialized) {
                    Twilio.init(accountSid, authToken);
                    initialized = true;
                }
            }
        }
    }
}
