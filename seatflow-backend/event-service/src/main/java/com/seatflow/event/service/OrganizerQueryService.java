package com.seatflow.event.service;

import com.seatflow.common.exception.ResourceNotFoundException;
import com.seatflow.event.dto.OrganizerDtos;
import com.seatflow.event.entity.OrganizerEntity;
import com.seatflow.event.entity.OrganizerStatus;
import com.seatflow.event.repository.OrganizerRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrganizerQueryService {

    OrganizerRepository organizerRepository;

    @Transactional(readOnly = true)
    public Optional<OrganizerDtos.OrganizerResponse> findMine(Long authUserId) {
        return organizerRepository.findByAuthUserId(authUserId).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public OrganizerDtos.OrganizerPublicResponse findPublicById(Long id) {
        OrganizerEntity organizer = organizerRepository.findByIdAndStatus(id, OrganizerStatus.APPROVED)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhà tổ chức ID: " + id));
        return new OrganizerDtos.OrganizerPublicResponse(
                organizer.getId(), organizer.getOrganizationName(),
                organizer.getDescription(), organizer.getLogoUrl(), organizer.getContactEmail()
        );
    }

    @Transactional(readOnly = true)
    public List<OrganizerDtos.OrganizerPublicResponse> findAllApproved() {
        return organizerRepository.findByStatus(OrganizerStatus.APPROVED).stream()
                .map(o -> new OrganizerDtos.OrganizerPublicResponse(
                        o.getId(), o.getOrganizationName(), o.getDescription(), o.getLogoUrl(), o.getContactEmail()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrganizerDtos.OrganizerResponse> findPending() {
        return organizerRepository.findByStatus(OrganizerStatus.PENDING).stream()
                .map(this::toResponse).toList();
    }

    private OrganizerDtos.OrganizerResponse toResponse(OrganizerEntity o) {
        return new OrganizerDtos.OrganizerResponse(
                o.getId(), o.getAuthUserId(), o.getOrganizationName(), o.getDescription(),
                o.getContactEmail(), o.getContactPhone(), o.getLogoUrl(),
                o.getStatus().name(), o.getRejectionReason(), o.getCreatedAt()
        );
    }
}
