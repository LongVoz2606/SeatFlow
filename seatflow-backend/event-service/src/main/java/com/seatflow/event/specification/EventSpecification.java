package com.seatflow.event.specification;

import com.seatflow.event.entity.EventEntity;
import org.springframework.data.jpa.domain.Specification;

public class EventSpecification {

    private EventSpecification() {
    }

    public static Specification<EventEntity> bySearchCriteria(EventSearchCriteria criteria) {
        Specification<EventEntity> statusSpec = (root, query, cb) -> cb.equal(root.get("status"), "ACTIVE");
        // Chỉ liệt kê "show" (event cha hoặc event độc lập kiểu cũ), không liệt kê từng suất diễn con.
        Specification<EventEntity> notASessionSpec = (root, query, cb) -> cb.isNull(root.get("parentEventId"));
        return criteria.specifications().stream()
                .reduce(statusSpec.and(notASessionSpec), Specification::and);
    }
}
