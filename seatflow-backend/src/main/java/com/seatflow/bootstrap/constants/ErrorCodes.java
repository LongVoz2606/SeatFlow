package com.seatflow.bootstrap.constants;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCodes {

    RESOURCE_NOT_FOUND("SEATFLOW_404", "Không tìm thấy tài nguyên được yêu cầu."),
    EVENT_NOT_FOUND("EVENT_404", "Không tìm thấy sự kiện với ID đã cho."),
    BOOKING_NOT_FOUND("BOOKING_404", "Không tìm thấy thông tin đơn đặt vé."),
    SEAT_UNAVAILABLE("SEAT_409", "Ghế bạn chọn đang được người khác giữ hoặc đã bán."),
    IDEMPOTENCY_CONFLICT("IDEMPOTENCY_409", "Yêu cầu này đã được hệ thống xử lý trước đó."),
    BOOKING_EXPIRED("BOOKING_410", "Thời gian giữ ghế của đơn đặt vé đã hết hạn."),
    INVALID_BOOKING_STATUS("BOOKING_400", "Đơn đặt vé ở trạng thái không hợp lệ để thực hiện thao tác."),
    SYSTEM_CONCURRENCY_BUSY("LOCK_409", "Hệ thống đang bận xử lý ghế này. Vui lòng thử lại sau giây lát."),
    INTERNAL_SERVER_ERROR("SEATFLOW_500", "Lỗi hệ thống nội bộ. Vui lòng thử lại sau.");

    private final String code;
    private final String message;

    public String formatMessage(Object... args) {
        return String.format(this.message, args);
    }
}
