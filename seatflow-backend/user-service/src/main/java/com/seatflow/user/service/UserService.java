package com.seatflow.user.service;

import com.seatflow.common.exception.ResourceNotFoundException;
import com.seatflow.user.entity.UserProfileEntity;
import com.seatflow.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    public UserProfileEntity getProfileByUserId(Long userId, String username, String email) {
        return userProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    log.info("Creating profile dynamically for userId: {}", userId);
                    UserProfileEntity profile = UserProfileEntity.builder()
                            .userId(userId)
                            .username(username != null ? username : "user_" + userId)
                            .email(email != null ? email : "user_" + userId + "@seatflow.com")
                            .fullName(username)
                            .build();
                    return userProfileRepository.save(profile);
                });
    }

    @Transactional
    public UserProfileEntity updateProfile(Long userId, String fullName, String phone, String avatarUrl) {
        UserProfileEntity profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy profile cho user: " + userId));

        if (fullName != null) profile.setFullName(fullName);
        if (phone != null) profile.setPhone(phone);
        if (avatarUrl != null) profile.setAvatarUrl(avatarUrl);

        log.info("Updated profile for userId: {}", userId);
        return userProfileRepository.save(profile);
    }
}
