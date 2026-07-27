package com.seatflow.payment.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.seatflow.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingEventListener {

    private final PaymentService paymentService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "seatflow.seat-held-events", groupId = "payment-service-group")
    public void handleSeatHeldEvent(String message) {
        log.info("Received SEAT_HELD event from Kafka: {}", message);
        try {
            Map<String, Object> payload = objectMapper.readValue(message, Map.class);
            String bookingCode = (String) payload.get("bookingCode");
            Long userId = ((Number) payload.get("userId")).longValue();
            
            BigDecimal amount = BigDecimal.ZERO;
            if (payload.containsKey("totalAmount")) {
                amount = new BigDecimal(payload.get("totalAmount").toString());
            }

            paymentService.createPendingPayment(bookingCode, userId, amount);
        } catch (Exception e) {
            log.error("Failed to process SEAT_HELD event", e);
        }
    }
}
