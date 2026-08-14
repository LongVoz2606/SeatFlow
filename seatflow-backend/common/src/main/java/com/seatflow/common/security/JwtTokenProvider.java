package com.seatflow.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.Optional;

/**
 * JWT utility shared across all services.
 * auth-service uses it to GENERATE tokens.
 * Other services use it to VALIDATE tokens.
 */
@Slf4j
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long accessTokenExpiryMs;

    public JwtTokenProvider(String secret, long accessTokenExpiryMs) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiryMs = accessTokenExpiryMs;
    }

    /**
     * Generate access token with user claims.
     */
    public String generateAccessToken(Long userId, String username, String role, String email, String fullName) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenExpiryMs);

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claims(Map.of(
                        "username", username,
                        "role", role,
                        "email", email == null ? "" : email,
                        "fullName", fullName == null ? "" : fullName
                ))
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }

    /**
     * Validate token and return claims if valid.
     */
    public Optional<Claims> validateToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Optional.of(claims);
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid JWT token: {}", e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Extract userId from valid token (returns null if invalid).
     */
    public Long extractUserId(String token) {
        return validateToken(token)
                .map(claims -> Long.parseLong(claims.getSubject()))
                .orElse(null);
    }

    /**
     * Extract username from valid token.
     */
    public String extractUsername(String token) {
        return validateToken(token)
                .map(claims -> claims.get("username", String.class))
                .orElse(null);
    }

    /**
     * Extract role from valid token.
     */
    public String extractRole(String token) {
        return validateToken(token)
                .map(claims -> claims.get("role", String.class))
                .orElse(null);
    }
}
