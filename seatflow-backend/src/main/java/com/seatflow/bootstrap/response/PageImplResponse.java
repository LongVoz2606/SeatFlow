package com.seatflow.bootstrap.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.ZonedDateTime;
import java.util.List;

@Schema(description = "Standard paginated list response wrapper")
public record PageImplResponse<T>(
    @Schema(description = "Response status code, 0 for success", example = "0")
    int code,

    @Schema(description = "Human-readable response message", example = "Thành công")
    String message,

    @Schema(description = "List of page content items")
    List<T> content,

    @Schema(description = "Success indicator flag", example = "true")
    boolean success,

    @Schema(description = "Total number of elements across all pages", example = "100")
    long totalElements,

    @Schema(description = "Total number of pages", example = "10")
    int totalPages,

    @Schema(description = "Current page number (1-indexed)", example = "1")
    int current,

    @Schema(description = "Response timestamp")
    ZonedDateTime timestamp
) {
    public static <T> PageImplResponse<T> of(List<T> content, boolean success, long totalElements, int totalPages, int current) {
        return new PageImplResponse<>(0, "Lấy danh sách thành công", content, success, totalElements, totalPages, current, ZonedDateTime.now());
    }
}
