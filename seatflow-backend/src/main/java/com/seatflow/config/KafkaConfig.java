package com.seatflow.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    public static final String BOOKING_EVENTS_TOPIC = "seatflow.booking-events";
    public static final String SEAT_HELD_TOPIC = "seatflow.seat-held-events";

    @Bean
    public NewTopic bookingEventsTopic() {
        return TopicBuilder.name(BOOKING_EVENTS_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic seatHeldTopic() {
        return TopicBuilder.name(SEAT_HELD_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
