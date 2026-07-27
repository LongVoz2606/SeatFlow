package com.seatflow.event.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "organizers")
@EqualsAndHashCode(callSuper = false)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrganizerEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "auth_user_id", nullable = false, unique = true)
    Long authUserId;

    @Column(name = "organization_name", nullable = false)
    String organizationName;

    @Column(name = "description", columnDefinition = "TEXT")
    String description;

    @Column(name = "contact_email", nullable = false, length = 100)
    String contactEmail;

    @Column(name = "contact_phone", length = 20)
    String contactPhone;

    @Column(name = "logo_url", length = 500)
    String logoUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    OrganizerStatus status = OrganizerStatus.PENDING;

    @Column(name = "rejection_reason", length = 500)
    String rejectionReason;

    @Column(name = "created_at", insertable = false, updatable = false)
    ZonedDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    ZonedDateTime updatedAt;
}
