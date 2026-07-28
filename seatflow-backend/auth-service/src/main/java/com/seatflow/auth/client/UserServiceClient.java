package com.seatflow.auth.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Optional;

/**
 * Gọi user-service để lấy số điện thoại đã lưu trong hồ sơ người dùng
 * (auth-service không lưu số điện thoại, chỉ user-service mới có).
 */
@Component
@Slf4j
public class UserServiceClient {

    private final RestClient restClient = RestClient.create();
    private final String userServiceUrl;

    public UserServiceClient(@Value("${seatflow.services.user-service-url:http://localhost:8082}") String userServiceUrl) {
        this.userServiceUrl = userServiceUrl;
    }

    public Optional<String> getPhone(Long userId) {
        try {
            ProfileEnvelope response = restClient.get()
                    .uri(userServiceUrl + "/api/users/{id}", userId)
                    .retrieve()
                    .body(ProfileEnvelope.class);
            if (response == null || response.data() == null) {
                return Optional.empty();
            }
            return Optional.ofNullable(response.data().phone());
        } catch (RestClientException e) {
            log.warn("Không lấy được số điện thoại của user {} từ user-service: {}", userId, e.getMessage());
            return Optional.empty();
        }
    }

    private record ProfileEnvelope(boolean success, ProfileData data) {}

    private record ProfileData(Long id, Long userId, String username, String email, String fullName, String phone, String avatarUrl) {}
}
