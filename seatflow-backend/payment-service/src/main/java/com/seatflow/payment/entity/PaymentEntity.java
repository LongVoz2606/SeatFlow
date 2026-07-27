package com.seatflow.payment.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "payments")
@EqualsAndHashCode(callSuper = false)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "booking_code", nullable = false, unique = true, length = 36)
    String bookingCode;

    @Column(name = "user_id", nullable = false)
    Long userId;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    BigDecimal amount;

    @Column(name = "method", nullable = false, length = 50)
    @Builder.Default
    String method = "MOCK";

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    String status = "PENDING";

    @Column(name = "transaction_id", length = 100)
    String transactionId;

    @Column(name = "created_at", insertable = false, updatable = false)
    ZonedDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    ZonedDateTime updatedAt;
}
