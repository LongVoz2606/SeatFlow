package com.seatflow.event.specification;

import com.seatflow.event.entity.EventEntity;
import lombok.Builder;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Builder
public record EventSearchCriteria(
        String search,
        String location,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Boolean hot,
        Long organizerId
) {

    public List<Specification<EventEntity>> specifications() {
        List<Specification<EventEntity>> specs = new ArrayList<>();
        specs.add(bySearch());
        specs.add(byLocation());
        specs.add(byMinPrice());
        specs.add(byMaxPrice());
        specs.add(byHot());
        specs.add(byOrganizerId());
        return specs;
    }

    private Specification<EventEntity> bySearch() {
        if (!StringUtils.hasText(search)) {
            return (root, query, cb) -> cb.conjunction();
        }
        String pattern = "%" + search.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), pattern),
                cb.like(cb.lower(root.get("description")), pattern)
        );
    }

    private Specification<EventEntity> byLocation() {
        if (!StringUtils.hasText(location)) {
            return (root, query, cb) -> cb.conjunction();
        }
        String pattern = "%" + location.toLowerCase() + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("location")), pattern);
    }

    private Specification<EventEntity> byMinPrice() {
        if (minPrice == null) {
            return (root, query, cb) -> cb.conjunction();
        }
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("maxPrice"), minPrice);
    }

    private Specification<EventEntity> byMaxPrice() {
        if (maxPrice == null) {
            return (root, query, cb) -> cb.conjunction();
        }
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("minPrice"), maxPrice);
    }

    private Specification<EventEntity> byHot() {
        if (hot == null || !hot) {
            return (root, query, cb) -> cb.conjunction();
        }
        return (root, query, cb) -> cb.isTrue(root.get("isHot"));
    }

    private Specification<EventEntity> byOrganizerId() {
        if (organizerId == null) {
            return (root, query, cb) -> cb.conjunction();
        }
        return (root, query, cb) -> cb.equal(root.get("organizerId"), organizerId);
    }
}
