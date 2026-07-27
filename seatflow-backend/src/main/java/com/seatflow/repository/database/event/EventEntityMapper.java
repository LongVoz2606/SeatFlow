package com.seatflow.repository.database.event;

import com.seatflow.bootstrap.mapper.MapStructGlobalConfig;
import com.seatflow.domain.event.Event;
import org.mapstruct.Mapper;

@Mapper(config = MapStructGlobalConfig.class, uses = {SeatEntityMapper.class})
public interface EventEntityMapper {
    Event toDomain(EventEntity entity);
    EventEntity toEntity(Event domain);
}
