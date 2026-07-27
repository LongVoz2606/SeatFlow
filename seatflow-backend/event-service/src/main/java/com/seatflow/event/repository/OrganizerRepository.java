package com.seatflow.event.repository;

import com.seatflow.event.entity.OrganizerEntity;
import com.seatflow.event.entity.OrganizerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizerRepository extends JpaRepository<OrganizerEntity, Long> {

    Optional<OrganizerEntity> findByAuthUserId(Long authUserId);

    List<OrganizerEntity> findByStatus(OrganizerStatus status);

    Optional<OrganizerEntity> findByIdAndStatus(Long id, OrganizerStatus status);
}
