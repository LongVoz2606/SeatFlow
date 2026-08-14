package com.seatflow.common.security;

import com.seatflow.common.exception.UnauthorizedException;
import com.seatflow.common.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * JWT Authentication Filter - shared base for all services.
 * Each service configures which paths are public via SecurityConfig.
 */
@Slf4j
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String token = extractToken(request);

        if (StringUtils.hasText(token)) {
            Optional<Claims> claimsOpt = jwtTokenProvider.validateToken(token);

            if (claimsOpt.isPresent()) {
                Claims claims = claimsOpt.get();
                Long userId = Long.parseLong(claims.getSubject());
                String username = claims.get("username", String.class);
                String role = claims.get("role", String.class);
                String email = claims.get("email", String.class);
                String fullName = claims.get("fullName", String.class);

                // Store user info in request attributes for downstream use
                request.setAttribute("userId", userId);
                request.setAttribute("username", username);
                request.setAttribute("role", role);
                request.setAttribute("email", email);
                request.setAttribute("fullName", fullName);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role))
                        );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
