package com.seatflow.bootstrap.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import java.time.ZonedDateTime;

@Schema(description = "Standard single object response wrapper")
public record ValueResponse<T>(
    @Schema(description = "Response status code, 0 for success", example = "0")
    int code,

    @Schema(description = "Human-readable response message", example = "Thành công")
    String message,

    @Schema(description = "Payload data")
    T data,

    @Schema(description = "Response timestamp")
    ZonedDateTime timestamp
) {
    public static <T> ValueResponse<T> of(T data) {
        return new ValueResponse<>(0, "Thành công", data, ZonedDateTime.now());
    }

    public static <T> ValueResponse<T> of(T data, String message) {
        return new ValueResponse<>(0, message, data, ZonedDateTime.now());
    }

    public static <T> ValueResponse<T> of(int code, String message, T data) {
        return new ValueResponse<>(code, message, data, ZonedDateTime.now());
    }
}
