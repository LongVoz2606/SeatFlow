package com.seatflow.payment.service;

import com.seatflow.common.exception.ResourceNotFoundException;
import com.seatflow.payment.entity.PaymentEntity;
import com.seatflow.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${seatflow.booking-service.url:http://localhost:8084}")
    private String bookingServiceUrl;

    @Transactional
    public PaymentEntity createPendingPayment(String bookingCode, Long userId, BigDecimal amount) {
        if (paymentRepository.findByBookingCode(bookingCode).isPresent()) {
            log.info("Payment already exists for bookingCode: {}", bookingCode);
            return paymentRepository.findByBookingCode(bookingCode).get();
        }

        PaymentEntity payment = PaymentEntity.builder()
                .bookingCode(bookingCode)
                .userId(userId)
                .amount(amount)
                .method("MOCK")
                .status("PENDING")
                .build();
        log.info("Created PENDING payment for bookingCode: {}, amount: {}", bookingCode, amount);
        return paymentRepository.save(payment);
    }

    @Transactional
    public PaymentEntity processMockPayment(String bookingCode) {
        PaymentEntity payment = paymentRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giao dịch thanh toán cho mã đặt vé: " + bookingCode));

        if ("SUCCESS".equals(payment.getStatus())) {
            return payment;
        }

        payment.setStatus("SUCCESS");
        payment.setTransactionId("TX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        PaymentEntity saved = paymentRepository.save(payment);
        log.info("Payment SUCCESS for bookingCode: {}, transactionId: {}", bookingCode, saved.getTransactionId());

        // Notify booking-service via REST API
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> body = Map.of(
                    "bookingCode", bookingCode,
                    "userId", payment.getUserId(),
                    "paymentMethod", payment.getMethod()
            );
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            String url = bookingServiceUrl + "/api/bookings/confirm";

            log.info("Calling booking-service to confirm booking: URL={}", url);
            restTemplate.postForObject(url, requestEntity, String.class);
            log.info("Successfully notified booking-service of confirmation for: {}", bookingCode);
        } catch (Exception e) {
            log.error("Failed to notify booking-service of payment success for bookingCode: {}", bookingCode, e);
        }

        return saved;
    }

    @Transactional(readOnly = true)
    public PaymentEntity getPaymentByBookingCode(String bookingCode) {
        return paymentRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giao dịch thanh toán cho mã đặt vé: " + bookingCode));
    }
}
