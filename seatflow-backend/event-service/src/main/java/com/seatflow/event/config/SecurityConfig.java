package com.seatflow.event.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.seatflow.common.security.JwtAuthFilter;
import com.seatflow.common.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${seatflow.jwt.secret}")
    private String jwtSecret;

    @Value("${seatflow.jwt.access-token-expiry-ms:86400000}")
    private long accessTokenExpiryMs;

    @Bean
    public JwtTokenProvider jwtTokenProvider() {
        return new JwtTokenProvider(jwtSecret, accessTokenExpiryMs);
    }

    @Bean
    public JwtAuthFilter jwtAuthFilter(JwtTokenProvider jwtTokenProvider, ObjectMapper objectMapper) {
        return new JwtAuthFilter(jwtTokenProvider, objectMapper);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Internal service-to-service calls (booking-service Feign client, không kèm JWT)
                        .requestMatchers(HttpMethod.POST, "/api/events/*/seats/hold").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/events/*/seats/confirm").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/organizers/internal/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/events/pending").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/events/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/organizers/pending").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/organizers/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/organizers").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/organizers/*").permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/api/events/*/hot").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/events/*/approve").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/events/*/reject").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/organizers/*/approve").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/organizers/*/reject").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/actuator/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
