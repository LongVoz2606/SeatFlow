package com.seatflow.domain.event;

import lombok.Builder;

@Builder
public record EventSearchCriteria(
    String search,
    String status
) {
}
