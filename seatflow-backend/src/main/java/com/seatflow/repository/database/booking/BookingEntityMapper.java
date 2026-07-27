package com.seatflow.repository.database.booking;

import com.seatflow.bootstrap.mapper.MapStructGlobalConfig;
import com.seatflow.domain.booking.Booking;
import com.seatflow.repository.database.event.SeatEntityMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = MapStructGlobalConfig.class, uses = {SeatEntityMapper.class})
public interface BookingEntityMapper {

    @Mapping(target = "reservedSeats", ignore = true)
    @Mapping(target = "eventTitle", ignore = true)
    Booking toDomain(BookingEntity entity);

    BookingEntity toEntity(Booking domain);
}
