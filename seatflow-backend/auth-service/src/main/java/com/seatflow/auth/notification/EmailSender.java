package com.seatflow.auth.notification;

import com.seatflow.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Gửi email qua SMTP (spring.mail.*). Nếu chưa cấu hình MAIL_USERNAME/MAIL_PASSWORD
 * (môi trường dev chưa có tài khoản SMTP thật), chỉ log mã OTP ra console để vẫn test được luồng.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EmailSender {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${seatflow.mail.from:SeatFlow <no-reply@seatflow.com>}")
    private String fromAddress;

    public void send(String to, String subject, String body) {
        if (!StringUtils.hasText(mailUsername)) {
            log.warn("[DEV-EMAIL] (SMTP chưa được cấu hình - MAIL_USERNAME trống) To: {} | Subject: {} | Body: {}", to, subject, body);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (MailException e) {
            log.error("Gửi email tới {} thất bại: {}", to, e.getMessage());
            throw new BusinessException("EMAIL_SEND_FAILED", "Không thể gửi email OTP, vui lòng thử lại sau.");
        }
    }
}
