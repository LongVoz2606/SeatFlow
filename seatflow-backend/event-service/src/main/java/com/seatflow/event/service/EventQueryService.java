package com.seatflow.event.service;

import com.seatflow.common.exception.ResourceNotFoundException;
import com.seatflow.event.dto.EventDtos;
import com.seatflow.event.entity.EventEntity;
import com.seatflow.event.entity.OrganizerEntity;
import com.seatflow.event.entity.SeatEntity;
import com.seatflow.event.entity.SeatStatus;
import com.seatflow.event.entity.ZoneEntity;
import com.seatflow.event.repository.EventRepository;
import com.seatflow.event.repository.OrganizerRepository;
import com.seatflow.event.repository.SeatRepository;
import com.seatflow.event.repository.ZoneRepository;
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
import java.util.Collections;
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
    ZoneRepository zoneRepository;

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
        List<EventEntity> events = eventRepository.findByOrganizerIdAndParentEventIdIsNullOrderByEventDateDesc(organizer.getId());
        return toEventResponses(events);
    }

    @Transactional(readOnly = true)
    public List<EventDtos.EventResponse> findPendingEvents() {
        List<EventEntity> events = eventRepository.findByStatusAndParentEventIdIsNullOrderByEventDateAsc("PENDING");
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

        List<Long> eventIds = events.stream().map(EventEntity::getId).toList();
        Map<Long, Integer> sessionCounts = new HashMap<>();
        if (!eventIds.isEmpty()) {
            eventRepository.countSessionsByParentIds(eventIds)
                    .forEach(row -> sessionCounts.put((Long) row[0], ((Long) row[1]).intValue()));
        }

        return events.stream().map(e -> toEventResponse(e, organizerNames, sessionCounts)).toList();
    }

    /**
     * Chi tiết sự kiện dùng cho trang xem/mua vé.
     * - Nếu id là event cha có suất diễn con: trả về thông tin chung + danh sách khu vực (loại vé/giá)
     *   + danh sách suất diễn để người dùng chọn, KHÔNG có sơ đồ ghế (mỗi suất diễn có sơ đồ riêng).
     * - Nếu id là 1 suất diễn cụ thể, hoặc 1 sự kiện độc lập kiểu cũ: trả về đầy đủ sơ đồ ghế như trước.
     */
    @Transactional(readOnly = true)
    public Optional<EventDtos.EventDetailResponse> findEventDetail(Long eventId) {
        return eventRepository.findById(eventId).map(event -> {
            boolean isParentShow = eventRepository.existsByParentEventId(eventId);

            OrganizerEntity organizer = event.getOrganizerId() != null
                    ? organizerRepository.findById(event.getOrganizerId()).orElse(null)
                    : null;

            Long zoneOwnerEventId = isParentShow ? eventId : event.getParentEventId();
            List<EventDtos.ZoneResponse> zones = zoneOwnerEventId != null
                    ? zoneRepository.findByEventIdOrderByIdAsc(zoneOwnerEventId).stream().map(this::toZoneResponse).toList()
                    : Collections.emptyList();

            List<EventDtos.SessionResponse> sessions;
            List<EventDtos.SeatResponse> seats;
            if (isParentShow) {
                sessions = eventRepository.findByParentEventIdOrderByEventDateAsc(eventId).stream()
                        .map(this::toSessionResponse).toList();
                seats = Collections.emptyList();
            } else {
                sessions = Collections.emptyList();
                seats = seatRepository.findByEventIdOrderBySeatRowAscSeatNumberAsc(eventId).stream()
                        .map(this::toSeatResponse).toList();
            }

            return new EventDtos.EventDetailResponse(
                    event.getId(), event.getTitle(), event.getDescription(),
                    event.getLocation(), event.getEventDate(), event.getBannerUrl(),
                    event.getTotalSeats(), event.getAvailableSeats(), event.getStatus(),
                    event.getOrganizerId(), organizer != null ? organizer.getOrganizationName() : null,
                    organizer != null ? organizer.getDescription() : null,
                    organizer != null ? organizer.getLogoUrl() : null,
                    event.getIsHot(), event.getMinPrice(), event.getMaxPrice(), event.getCategory(),
                    event.getParentEventId(), zones, sessions, seats
            );
        });
    }

    public EventDtos.EventResponse toEventResponse(EventEntity e, Map<Long, String> organizerNames, Map<Long, Integer> sessionCounts) {
        return new EventDtos.EventResponse(
                e.getId(), e.getTitle(), e.getDescription(), e.getLocation(),
                e.getEventDate(), e.getBannerUrl(), e.getTotalSeats(),
                e.getAvailableSeats(), e.getStatus(),
                e.getOrganizerId(), e.getOrganizerId() != null ? organizerNames.get(e.getOrganizerId()) : null,
                e.getIsHot(), e.getMinPrice(), e.getMaxPrice(), e.getCategory(), e.getCreatedAt(),
                e.getRejectionReason(), sessionCounts.getOrDefault(e.getId(), 0)
        );
    }

    public EventDtos.SeatResponse toSeatResponse(SeatEntity s) {
        return new EventDtos.SeatResponse(
                s.getId(), s.getEventId(), s.getZoneId(), s.getRowIndex(), s.getColIndex(), s.getSeatNumber(),
                s.getSeatRow(), s.getSeatType(), s.getPrice(), s.getStatus().name()
        );
    }

    public EventDtos.ZoneResponse toZoneResponse(ZoneEntity z) {
        return new EventDtos.ZoneResponse(
                z.getId(), z.getName(), z.getSeatType(), z.getPrice(), z.getRowCount(), z.getColCount(),
                z.getRowSpacing(), z.getColSpacing(), z.getCurveAngle(), z.getPositionX(), z.getPositionY(),
                z.getRotation(), z.getColor()
        );
    }

    public EventDtos.SessionResponse toSessionResponse(EventEntity session) {
        return new EventDtos.SessionResponse(
                session.getId(), session.getEventDate(), session.getTotalSeats(),
                session.getAvailableSeats(), session.getStatus()
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
