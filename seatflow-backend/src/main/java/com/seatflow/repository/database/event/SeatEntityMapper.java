package com.seatflow.repository.database.event;

import com.seatflow.bootstrap.mapper.MapStructGlobalConfig;
import com.seatflow.domain.event.Seat;
import org.mapstruct.Mapper;

@Mapper(config = MapStructGlobalConfig.class)
public interface SeatEntityMapper {
    Seat toDomain(SeatEntity entity);
    SeatEntity toEntity(Seat domain);
}
