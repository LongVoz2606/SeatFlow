package com.seatflow.event.specification;

import com.seatflow.event.entity.EventEntity;
import org.springframework.data.jpa.domain.Specification;

public class EventSpecification {

    private EventSpecification() {
    }

    public static Specification<EventEntity> bySearchCriteria(EventSearchCriteria criteria) {
        Specification<EventEntity> statusSpec = (root, query, cb) -> cb.equal(root.get("status"), "ACTIVE");
        return criteria.specifications().stream()
                .reduce(statusSpec, Specification::and);
    }
}
