package com.seatflow.event.service;

import com.seatflow.common.exception.ResourceNotFoundException;
import com.seatflow.event.dto.EventDtos;
import com.seatflow.event.entity.EventEntity;
import com.seatflow.event.entity.OrganizerEntity;
import com.seatflow.event.entity.SeatEntity;
import com.seatflow.event.entity.SeatStatus;
import com.seatflow.event.repository.EventRepository;
import com.seatflow.event.repository.OrganizerRepository;
import com.seatflow.event.repository.SeatRepository;
import com.seatflow.event.specification.EventSearchCriteria;
import com.seatflow.event.specification.EventSpecification;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EventQueryService {

    EventRepository eventRepository;
    SeatRepository seatRepository;
    OrganizerRepository organizerRepository;

    @Transactional(readOnly = true)
    public List<EventDtos.EventResponse> searchEvents(EventSearchCriteria criteria) {
        List<EventEntity> events = eventRepository.findAll(EventSpecification.bySearchCriteria(criteria));
        return toEventResponses(events);
    }

    @Transactional(readOnly = true)
    public com.seatflow.common.response.PageResponse<EventDtos.EventResponse> searchEventsPage(
            EventSearchCriteria criteria, org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<EventEntity> page = eventRepository.findAll(EventSpecification.bySearchCriteria(criteria), pageable);
        List<EventDtos.EventResponse> content = toEventResponses(page.getContent());
        return com.seatflow.common.response.PageResponse.of(content, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public List<EventDtos.EventResponse> findMyEvents(Long organizerAuthUserId) {
        OrganizerEntity organizer = organizerRepository.findByAuthUserId(organizerAuthUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Bạn chưa đăng ký làm nhà tổ chức."));
        List<EventEntity> events = eventRepository.findByOrganizerIdOrderByEventDateDesc(organizer.getId());
        return toEventResponses(events);
    }

    @Transactional(readOnly = true)
    public List<EventDtos.EventResponse> findPendingEvents() {
        List<EventEntity> events = eventRepository.findByStatusOrderByEventDateAsc("PENDING");
        return toEventResponses(events);
    }

    private List<EventDtos.EventResponse> toEventResponses(List<EventEntity> events) {
        List<Long> organizerIds = events.stream()
                .map(EventEntity::getOrganizerId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .toList();
        Map<Long, String> organizerNames = new HashMap<>();
        if (!organizerIds.isEmpty()) {
            organizerRepository.findAllById(organizerIds)
                    .forEach(o -> organizerNames.put(o.getId(), o.getOrganizationName()));
        }
        return events.stream().map(e -> toEventResponse(e, organizerNames)).toList();
    }

    @Transactional(readOnly = true)
    public Optional<EventDtos.EventDetailResponse> findByIdWithSeatMap(Long eventId) {
        return eventRepository.findById(eventId).map(event -> {
            List<SeatEntity> seats = seatRepository.findByEventIdOrderBySeatRowAscSeatNumberAsc(eventId);
            String organizerName = event.getOrganizerId() != null
                    ? organizerRepository.findById(event.getOrganizerId())
                            .map(OrganizerEntity::getOrganizationName).orElse(null)
                    : null;
            return new EventDtos.EventDetailResponse(
                    event.getId(), event.getTitle(), event.getDescription(),
                    event.getLocation(), event.getEventDate(), event.getBannerUrl(),
                    event.getTotalSeats(), event.getAvailableSeats(), event.getStatus(),
                    event.getOrganizerId(), organizerName, event.getIsHot(),
                    event.getMinPrice(), event.getMaxPrice(), event.getCategory(),
                    seats.stream().map(this::toSeatResponse).toList()
            );
        });
    }

    public EventDtos.EventResponse toEventResponse(EventEntity e, Map<Long, String> organizerNames) {
        return new EventDtos.EventResponse(
                e.getId(), e.getTitle(), e.getDescription(), e.getLocation(),
                e.getEventDate(), e.getBannerUrl(), e.getTotalSeats(),
                e.getAvailableSeats(), e.getStatus(),
                e.getOrganizerId(), e.getOrganizerId() != null ? organizerNames.get(e.getOrganizerId()) : null,
                e.getIsHot(), e.getMinPrice(), e.getMaxPrice(), e.getCategory(), e.getCreatedAt(),
                e.getRejectionReason()
        );
    }

    public EventDtos.SeatResponse toSeatResponse(SeatEntity s) {
        return new EventDtos.SeatResponse(
                s.getId(), s.getEventId(), s.getSeatNumber(),
                s.getSeatRow(), s.getSeatType(), s.getPrice(), s.getStatus().name()
        );
    }

    /** Release expired holds every 10 seconds */
    @Scheduled(fixedRate = 10000)
    @Transactional
    public void releaseExpiredSeatHolds() {
        List<SeatEntity> expired = seatRepository.findExpiredHeldSeats(SeatStatus.HELD, ZonedDateTime.now());
        if (!expired.isEmpty()) {
            expired.forEach(seat -> {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setHeldUntil(null);
                seat.setHeldByUserId(null);
            });
            seatRepository.saveAll(expired);
            log.info("Released {} expired seat holds", expired.size());
        }
    }
}
