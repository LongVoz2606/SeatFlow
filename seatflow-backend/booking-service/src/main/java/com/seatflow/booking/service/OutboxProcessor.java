package com.seatflow.booking.service;

import com.seatflow.booking.config.KafkaConfig;
import com.seatflow.booking.entity.OutboxEventEntity;
import com.seatflow.booking.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OutboxProcessor {

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void processOutboxEvents() {
        List<OutboxEventEntity> pendingEvents = outboxEventRepository.findByStatusOrderByCreatedAtAsc("PENDING");
        if (pendingEvents.isEmpty()) {
            return;
        }

        log.info("Processing {} pending outbox events...", pendingEvents.size());

        for (OutboxEventEntity event : pendingEvents) {
            String topic = determineTopic(event.getType());
            try {
                // Publish to Kafka synchronously
                kafkaTemplate.send(topic, event.getAggregateId(), event.getPayload()).get();
                event.setStatus("PUBLISHED");
                log.info("Successfully published outbox event ID={} to topic={}", event.getId(), topic);
            } catch (Exception e) {
                log.error("Failed to publish outbox event ID={} to topic={}. Will retry.", event.getId(), topic, e);
                event.setStatus("FAILED");
            }
        }
        outboxEventRepository.saveAll(pendingEvents);
    }

    private String determineTopic(String eventType) {
        if ("SEAT_HELD".equals(eventType)) {
            return KafkaConfig.SEAT_HELD_TOPIC;
        }
        return KafkaConfig.BOOKING_EVENTS_TOPIC;
    }
}
