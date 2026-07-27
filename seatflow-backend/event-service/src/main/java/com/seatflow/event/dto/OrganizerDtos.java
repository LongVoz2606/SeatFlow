package com.seatflow.event.dto;

import java.time.ZonedDateTime;

public class OrganizerDtos {

    public record RegisterOrganizerRequest(
            String organizationName,
            String description,
            String contactEmail,
            String contactPhone,
            String logoUrl
    ) {}

    public record OrganizerResponse(
            Long id,
            Long authUserId,
            String organizationName,
            String description,
            String contactEmail,
            String contactPhone,
            String logoUrl,
            String status,
            String rejectionReason,
            ZonedDateTime createdAt
    ) {}

    public record OrganizerPublicResponse(
            Long id,
            String organizationName,
            String description,
            String logoUrl,
            String contactEmail
    ) {}

    public record RejectOrganizerRequest(
            String reason
    ) {}
}
