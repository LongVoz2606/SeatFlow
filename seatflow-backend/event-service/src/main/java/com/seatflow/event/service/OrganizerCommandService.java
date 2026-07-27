package com.seatflow.event.service;

import com.seatflow.common.exception.BusinessException;
import com.seatflow.common.exception.ResourceNotFoundException;
import com.seatflow.event.dto.OrganizerDtos;
import com.seatflow.event.entity.OrganizerEntity;
import com.seatflow.event.entity.OrganizerStatus;
import com.seatflow.event.repository.OrganizerRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class OrganizerCommandService {

    OrganizerRepository organizerRepository;

    @Transactional
    public Long register(Long authUserId, OrganizerDtos.RegisterOrganizerRequest request) {
        organizerRepository.findByAuthUserId(authUserId).ifPresent(existing -> {
            throw new BusinessException("ORGANIZER_ALREADY_EXISTS", "Bạn đã có hồ sơ nhà tổ chức (trạng thái: " + existing.getStatus() + ").");
        });

        OrganizerEntity organizer = OrganizerEntity.builder()
                .authUserId(authUserId)
                .organizationName(request.organizationName())
                .description(request.description())
                .contactEmail(request.contactEmail())
                .contactPhone(request.contactPhone())
                .logoUrl(request.logoUrl())
                .status(OrganizerStatus.PENDING)
                .build();
        OrganizerEntity saved = organizerRepository.save(organizer);
        log.info("New organizer registration: {} (authUserId={})", saved.getOrganizationName(), authUserId);
        return saved.getId();
    }

    @Transactional
    public void resubmit(Long authUserId, OrganizerDtos.RegisterOrganizerRequest request) {
        OrganizerEntity organizer = organizerRepository.findByAuthUserId(authUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Bạn chưa có hồ sơ nhà tổ chức."));
        if (organizer.getStatus() != OrganizerStatus.REJECTED) {
            throw new BusinessException("ORGANIZER_NOT_REJECTED", "Chỉ có thể gửi lại hồ sơ đã bị từ chối.");
        }
        organizer.setOrganizationName(request.organizationName());
        organizer.setDescription(request.description());
        organizer.setContactEmail(request.contactEmail());
        organizer.setContactPhone(request.contactPhone());
        organizer.setLogoUrl(request.logoUrl());
        organizer.setStatus(OrganizerStatus.PENDING);
        organizer.setRejectionReason(null);
        organizerRepository.save(organizer);
    }

    @Transactional
    public void approve(Long id) {
        OrganizerEntity organizer = organizerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ nhà tổ chức ID: " + id));
        organizer.setStatus(OrganizerStatus.APPROVED);
        organizer.setRejectionReason(null);
        organizerRepository.save(organizer);
        log.info("Organizer {} approved", id);
    }

    @Transactional
    public void reject(Long id, String reason) {
        OrganizerEntity organizer = organizerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ nhà tổ chức ID: " + id));
        organizer.setStatus(OrganizerStatus.REJECTED);
        organizer.setRejectionReason(reason);
        organizerRepository.save(organizer);
        log.info("Organizer {} rejected: {}", id, reason);
    }
}
