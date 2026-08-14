package com.seatflow.event.service;

import com.seatflow.common.exception.BusinessException;
import com.seatflow.common.exception.ResourceNotFoundException;
import com.seatflow.common.exception.UnauthorizedException;
import com.seatflow.event.dto.EventDtos;
import com.seatflow.event.entity.EventEntity;
import com.seatflow.event.entity.OrganizerEntity;
import com.seatflow.event.entity.OrganizerStatus;
import com.seatflow.event.entity.SeatEntity;
import com.seatflow.event.entity.SeatStatus;
import com.seatflow.event.entity.ZoneEntity;
import com.seatflow.event.repository.EventRepository;
import com.seatflow.event.repository.OrganizerRepository;
import com.seatflow.event.repository.SeatRepository;
import com.seatflow.event.repository.ZoneRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EventCommandService {

    EventRepository eventRepository;
    SeatRepository seatRepository;
    OrganizerRepository organizerRepository;
    ZoneRepository zoneRepository;
    EventQueryService eventQueryService;

    /**
     * Organizer (đã được Admin duyệt) tạo sự kiện mới: 1 event cha (thông tin chung + các khu vực
     * ghế tùy biến) và N suất diễn con, mỗi suất diễn được sinh sẵn ghế theo đúng sơ đồ khu vực.
     */
    @Transactional
    public Long createEvent(Long authUserId, EventDtos.CreateEventRequest request) {
        OrganizerEntity organizer = organizerRepository.findByAuthUserId(authUserId)
                .orElseThrow(() -> new UnauthorizedException("Bạn cần đăng ký làm nhà tổ chức trước khi tạo sự kiện."));
        if (organizer.getStatus() != OrganizerStatus.APPROVED) {
            throw new UnauthorizedException("Hồ sơ nhà tổ chức của bạn chưa được Admin duyệt.");
        }
        if (CollectionUtils.isEmpty(request.zones())) {
            throw new BusinessException("ZONES_REQUIRED", "Sự kiện cần có ít nhất 1 khu vực ghế.");
        }
        if (CollectionUtils.isEmpty(request.sessionDates())) {
            throw new BusinessException("SESSION_DATES_REQUIRED", "Sự kiện cần có ít nhất 1 suất diễn.");
        }

        int seatsPerSession = 0;
        BigDecimal minPrice = null;
        BigDecimal maxPrice = null;
        for (EventDtos.ZoneRequest zoneReq : request.zones()) {
            seatsPerSession += zoneReq.rowCount() * zoneReq.colCount();
            minPrice = minPrice == null || zoneReq.price().compareTo(minPrice) < 0 ? zoneReq.price() : minPrice;
            maxPrice = maxPrice == null || zoneReq.price().compareTo(maxPrice) > 0 ? zoneReq.price() : maxPrice;
        }

        ZonedDateTime earliestSession = request.sessionDates().stream().min(Comparator.naturalOrder()).orElseThrow();

        EventEntity parent = EventEntity.builder()
                .title(request.title())
                .description(request.description())
                .location(request.location())
                .eventDate(earliestSession)
                .bannerUrl(request.bannerUrl())
                .category(request.category() != null ? request.category() : "Music")
                .totalSeats(seatsPerSession)
                .availableSeats(seatsPerSession)
                .status("PENDING")
                .organizerId(organizer.getId())
                .isHot(false)
                .minPrice(minPrice != null ? minPrice : BigDecimal.ZERO)
                .maxPrice(maxPrice != null ? maxPrice : BigDecimal.ZERO)
                .build();
        EventEntity savedParent = eventRepository.save(parent);

        List<ZoneEntity> savedZones = new ArrayList<>();
        for (EventDtos.ZoneRequest zoneReq : request.zones()) {
            ZoneEntity zone = ZoneEntity.builder()
                    .eventId(savedParent.getId())
                    .name(zoneReq.name())
                    .seatType(zoneReq.seatType())
                    .price(zoneReq.price())
                    .rowCount(zoneReq.rowCount())
                    .colCount(zoneReq.colCount())
                    .rowSpacing(zoneReq.rowSpacing() != null ? zoneReq.rowSpacing() : BigDecimal.valueOf(36))
                    .colSpacing(zoneReq.colSpacing() != null ? zoneReq.colSpacing() : BigDecimal.valueOf(32))
                    .curveAngle(zoneReq.curveAngle() != null ? zoneReq.curveAngle() : BigDecimal.ZERO)
                    .positionX(zoneReq.positionX() != null ? zoneReq.positionX() : BigDecimal.ZERO)
                    .positionY(zoneReq.positionY() != null ? zoneReq.positionY() : BigDecimal.ZERO)
                    .rotation(zoneReq.rotation() != null ? zoneReq.rotation() : BigDecimal.ZERO)
                    .color(zoneReq.color())
                    .build();
            savedZones.add(zoneRepository.save(zone));
        }

        int sessionIndex = 1;
        for (ZonedDateTime sessionDate : request.sessionDates()) {
            EventEntity child = EventEntity.builder()
                    .title(request.title())
                    .description(request.description())
                    .location(request.location())
                    .eventDate(sessionDate)
                    .bannerUrl(request.bannerUrl())
                    .category(request.category() != null ? request.category() : "Music")
                    .totalSeats(seatsPerSession)
                    .availableSeats(seatsPerSession)
                    .status("PENDING")
                    .organizerId(organizer.getId())
                    .parentEventId(savedParent.getId())
                    .isHot(false)
                    .minPrice(minPrice != null ? minPrice : BigDecimal.ZERO)
                    .maxPrice(maxPrice != null ? maxPrice : BigDecimal.ZERO)
                    .build();
            EventEntity savedChild = eventRepository.save(child);

            List<SeatEntity> seatsToCreate = new ArrayList<>();
            int zi = 1;
            for (ZoneEntity zone : savedZones) {
                for (int row = 0; row < zone.getRowCount(); row++) {
                    String rowLabel = zi + rowLetter(row);
                    for (int col = 0; col < zone.getColCount(); col++) {
                        seatsToCreate.add(SeatEntity.builder()
                                .eventId(savedChild.getId())
                                .zoneId(zone.getId())
                                .rowIndex(row)
                                .colIndex(col)
                                .seatNumber(rowLabel + (col + 1))
                                .seatRow(rowLabel)
                                .seatType(zone.getSeatType())
                                .price(zone.getPrice())
                                .status(SeatStatus.AVAILABLE)
                                .version(0L)
                                .build());
                    }
                }
                zi++;
            }
            seatRepository.saveAll(seatsToCreate);
            log.info("Created session {} (id={}, date={}) with {} seats for parent event {}",
                    sessionIndex, savedChild.getId(), sessionDate, seatsToCreate.size(), savedParent.getId());
            sessionIndex++;
        }

        log.info("Organizer {} created event '{}' (id={}) with {} zones and {} sessions",
                organizer.getId(), savedParent.getTitle(), savedParent.getId(), savedZones.size(), request.sessionDates().size());
        return savedParent.getId();
    }

    private String rowLetter(int rowIndex0Based) {
        return rowIndex0Based < 26
                ? String.valueOf((char) ('A' + rowIndex0Based))
                : "R" + (rowIndex0Based + 1);
    }

    /**
     * Admin gắn/gỡ cờ "HOT" cho sự kiện để nổi bật ở trang chủ.
     */
    @Transactional
    public void setHot(Long eventId, boolean hot) {
        EventEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sự kiện ID: " + eventId));
        event.setIsHot(hot);
        eventRepository.save(event);
    }

    /**
     * Admin duyệt sự kiện đang chờ (PENDING) để công khai (ACTIVE).
     * Duyệt event cha sẽ cascade duyệt luôn toàn bộ suất diễn con của nó.
     */
    @Transactional
    public void approveEvent(Long eventId) {
        EventEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sự kiện ID: " + eventId));
        event.setStatus("ACTIVE");
        event.setRejectionReason(null);
        eventRepository.save(event);

        List<EventEntity> sessions = eventRepository.findByParentEventIdOrderByEventDateAsc(eventId);
        sessions.forEach(s -> {
            s.setStatus("ACTIVE");
            s.setRejectionReason(null);
        });
        eventRepository.saveAll(sessions);
        log.info("Event {} approved ({} sessions)", eventId, sessions.size());
    }

    /**
     * Admin từ chối sự kiện đang chờ duyệt (cascade xuống các suất diễn con).
     */
    @Transactional
    public void rejectEvent(Long eventId, String reason) {
        EventEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sự kiện ID: " + eventId));
        event.setStatus("REJECTED");
        event.setRejectionReason(reason);
        eventRepository.save(event);

        List<EventEntity> sessions = eventRepository.findByParentEventIdOrderByEventDateAsc(eventId);
        sessions.forEach(s -> {
            s.setStatus("REJECTED");
            s.setRejectionReason(reason);
        });
        eventRepository.saveAll(sessions);
        log.info("Event {} rejected: {} ({} sessions)", eventId, reason, sessions.size());
    }

    /**
     * Internal API: hold seats (called by booking-service via HTTP).
     */
    @Transactional
    public EventDtos.HoldSeatsResponse holdSeats(Long eventId, EventDtos.HoldSeatsRequest request) {
        EventEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sự kiện ID: " + eventId));

        List<SeatEntity> seats = seatRepository.findByEventIdAndIdIn(eventId, request.seatIds());
        if (seats.size() != request.seatIds().size()) {
            throw new ResourceNotFoundException("Một hoặc nhiều ghế không tồn tại trong sự kiện này.");
        }

        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime expiresAt = now.plusMinutes(request.holdDurationMinutes());

        for (SeatEntity seat : seats) {
            boolean expiredHold = seat.getStatus() == SeatStatus.HELD
                    && seat.getHeldUntil() != null
                    && seat.getHeldUntil().isBefore(now);

            if (seat.getStatus() != SeatStatus.AVAILABLE && !expiredHold) {
                throw new IllegalStateException("Ghế " + seat.getSeatNumber() + " không còn trống.");
            }
            seat.setStatus(SeatStatus.HELD);
            seat.setHeldUntil(expiresAt);
            seat.setHeldByUserId(request.userId());
        }

        seatRepository.saveAll(seats);
        log.info("Held {} seats for userId={} in eventId={}", seats.size(), request.userId(), eventId);

        List<EventDtos.SeatResponse> heldSeats = seats.stream()
                .map(eventQueryService::toSeatResponse).toList();
        return new EventDtos.HoldSeatsResponse(true, heldSeats, "Ghế đã được giữ thành công.");
    }

    /**
     * Internal API: confirm seats (called by booking-service after payment).
     */
    @Transactional
    public void confirmSeats(Long eventId, EventDtos.ConfirmSeatsRequest request) {
        EventEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sự kiện ID: " + eventId));

        List<SeatEntity> seats = seatRepository.findByEventIdAndIdIn(eventId, request.seatIds());
        seats.forEach(seat -> {
            seat.setStatus(SeatStatus.BOOKED);
            seat.setHeldUntil(null);
        });
        seatRepository.saveAll(seats);

        event.setAvailableSeats(Math.max(0, event.getAvailableSeats() - seats.size()));
        eventRepository.save(event);

        log.info("Confirmed {} seats in eventId={}", seats.size(), eventId);
    }
}
