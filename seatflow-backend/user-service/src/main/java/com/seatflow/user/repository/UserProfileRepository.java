package com.seatflow.user.repository;

import com.seatflow.user.entity.UserProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfileEntity, Long> {

    Optional<UserProfileEntity> findByUserId(Long userId);

    Optional<UserProfileEntity> findByUsername(String username);

    Optional<UserProfileEntity> findByEmail(String email);
}
